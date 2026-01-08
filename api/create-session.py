"""Vercel serverless function for exchanging workflow ids for ChatKit client secrets."""

import json
import os
import uuid
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs
import urllib.request
import urllib.error

DEFAULT_CHATKIT_BASE = "https://api.openai.com"
SESSION_COOKIE_NAME = "chatkit_session_id"
SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30  # 30 days


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle POST request to create ChatKit session."""
        try:
            # Get API key from environment
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                self.send_error_response(
                    {"error": "Missing OPENAI_API_KEY environment variable"}, 500
                )
                return

            # Read request body
            content_length = int(self.headers.get("Content-Length", 0))
            body_raw = self.rfile.read(content_length) if content_length > 0 else b""
            body = self.parse_json_body(body_raw)

            # Get workflow ID
            workflow_id = self.resolve_workflow_id(body)
            if not workflow_id:
                self.send_error_response({"error": "Missing workflow id"}, 400)
                return

            # Get or create user ID
            user_id, new_cookie = self.resolve_user()

            # Call OpenAI ChatKit API
            api_base = self.chatkit_api_base()
            url = f"{api_base}/v1/chatkit/sessions"

            request_data = json.dumps(
                {"workflow": {"id": workflow_id}, "user": user_id}
            ).encode("utf-8")

            req = urllib.request.Request(
                url,
                data=request_data,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "OpenAI-Beta": "chatkit_beta=v1",
                    "Content-Type": "application/json",
                },
                method="POST",
            )

            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    response_data = response.read()
                    payload = json.loads(response_data)

                    client_secret = payload.get("client_secret")
                    expires_after = payload.get("expires_after")

                    if not client_secret:
                        self.send_error_response(
                            {"error": "Missing client secret in response"},
                            502,
                            new_cookie,
                        )
                        return

                    self.send_success_response(
                        {
                            "client_secret": client_secret,
                            "expires_after": expires_after,
                        },
                        new_cookie,
                    )

            except urllib.error.HTTPError as e:
                error_body = e.read().decode("utf-8")
                try:
                    error_payload = json.loads(error_body)
                    error_message = error_payload.get("error", {})
                    if isinstance(error_message, dict):
                        error_message = error_message.get("message", str(e))
                except:
                    error_message = str(e)

                self.send_error_response(
                    {"error": error_message}, e.code, new_cookie
                )

            except urllib.error.URLError as e:
                self.send_error_response(
                    {"error": f"Failed to reach ChatKit API: {e}"}, 502, new_cookie
                )

        except Exception as e:
            self.send_error_response({"error": str(e)}, 500)

    def parse_json_body(self, body_raw):
        """Parse JSON body from request."""
        if not body_raw:
            return {}
        try:
            return json.loads(body_raw)
        except json.JSONDecodeError:
            return {}

    def resolve_workflow_id(self, body):
        """Get workflow ID from body or environment."""
        workflow = body.get("workflow", {})
        workflow_id = None
        if isinstance(workflow, dict):
            workflow_id = workflow.get("id")
        workflow_id = workflow_id or body.get("workflowId")

        # Fallback to environment variable
        env_workflow = os.getenv("CHATKIT_WORKFLOW_ID") or os.getenv(
            "VITE_CHATKIT_WORKFLOW_ID"
        )
        if not workflow_id and env_workflow:
            workflow_id = env_workflow

        if workflow_id and isinstance(workflow_id, str) and workflow_id.strip():
            return workflow_id.strip()
        return None

    def resolve_user(self):
        """Get existing user ID from cookie or create new one."""
        cookie_header = self.headers.get("Cookie", "")
        cookies = {}
        for cookie in cookie_header.split(";"):
            cookie = cookie.strip()
            if "=" in cookie:
                key, value = cookie.split("=", 1)
                cookies[key] = value

        existing = cookies.get(SESSION_COOKIE_NAME)
        if existing:
            return existing, None

        user_id = str(uuid.uuid4())
        return user_id, user_id

    def chatkit_api_base(self):
        """Get ChatKit API base URL."""
        return (
            os.getenv("CHATKIT_API_BASE")
            or os.getenv("VITE_CHATKIT_API_BASE")
            or DEFAULT_CHATKIT_BASE
        )

    def is_prod(self):
        """Check if running in production."""
        env = (os.getenv("ENVIRONMENT") or os.getenv("VERCEL_ENV") or "").lower()
        return env == "production"

    def send_success_response(self, payload, cookie_value=None):
        """Send successful JSON response."""
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Credentials", "true")

        if cookie_value:
            secure_flag = "; Secure" if self.is_prod() else ""
            cookie = (
                f"{SESSION_COOKIE_NAME}={cookie_value}; "
                f"Max-Age={SESSION_COOKIE_MAX_AGE_SECONDS}; "
                f"Path=/; HttpOnly; SameSite=Lax{secure_flag}"
            )
            self.send_header("Set-Cookie", cookie)

        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def send_error_response(self, payload, status_code, cookie_value=None):
        """Send error JSON response."""
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Credentials", "true")

        if cookie_value:
            secure_flag = "; Secure" if self.is_prod() else ""
            cookie = (
                f"{SESSION_COOKIE_NAME}={cookie_value}; "
                f"Max-Age={SESSION_COOKIE_MAX_AGE_SECONDS}; "
                f"Path=/; HttpOnly; SameSite=Lax{secure_flag}"
            )
            self.send_header("Set-Cookie", cookie)

        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def do_OPTIONS(self):
        """Handle CORS preflight request."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.end_headers()
