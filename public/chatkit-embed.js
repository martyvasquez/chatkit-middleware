/**
 * ChatKit Embeddable Widget for Squarespace
 *
 * Usage:
 * 1. Add this script to your Squarespace site's Code Injection (Footer)
 * 2. Configure the CHATKIT_BASE_URL to point to your Vercel deployment
 *
 * Example:
 * <script>
 *   window.CHATKIT_CONFIG = {
 *     baseUrl: 'https://your-app.vercel.app',
 *     position: 'bottom-right', // 'bottom-right', 'bottom-left', 'inline'
 *     buttonColor: '#0066ff',
 *     buttonText: '💬',
 *   };
 * </script>
 * <script src="https://your-app.vercel.app/chatkit-embed.js"></script>
 */

(function() {
  'use strict';

  // Default configuration
  const defaultConfig = {
    baseUrl: window.location.origin,
    position: 'bottom-right',
    buttonColor: '#0066ff',
    buttonText: '💬',
    buttonSize: '60px',
    windowWidth: '400px',
    windowHeight: '600px',
    zIndex: 9999,
  };

  // Merge user config with defaults
  const config = Object.assign({}, defaultConfig, window.CHATKIT_CONFIG || {});

  // Generate unique ID for this instance
  const instanceId = 'chatkit-' + Math.random().toString(36).substr(2, 9);

  // Create styles
  const style = document.createElement('style');
  style.textContent = `
    .chatkit-button {
      position: fixed;
      ${config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
      ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      width: ${config.buttonSize};
      height: ${config.buttonSize};
      border-radius: 50%;
      background-color: ${config.buttonColor};
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: ${config.zIndex};
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chatkit-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .chatkit-button:active {
      transform: scale(0.95);
    }

    .chatkit-window {
      position: fixed;
      ${config.position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;'}
      ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      width: ${config.windowWidth};
      height: ${config.windowHeight};
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 120px);
      border: none;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: ${config.zIndex - 1};
      display: none;
      background: white;
    }

    .chatkit-window.open {
      display: block;
      animation: chatkit-slide-in 0.3s ease-out;
    }

    .chatkit-window.closing {
      animation: chatkit-slide-out 0.3s ease-in;
    }

    @keyframes chatkit-slide-in {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes chatkit-slide-out {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
    }

    @media (max-width: 768px) {
      .chatkit-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 120px);
      }
    }

    .chatkit-inline {
      width: 100%;
      height: 600px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .chatkit-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      z-index: ${config.zIndex - 2};
      display: none;
    }

    .chatkit-overlay.open {
      display: block;
      animation: chatkit-fade-in 0.3s ease-out;
    }

    @keyframes chatkit-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Create button
  const button = document.createElement('button');
  button.className = 'chatkit-button';
  button.innerHTML = config.buttonText;
  button.setAttribute('aria-label', 'Open chat');
  button.setAttribute('type', 'button');

  // Create iframe window
  const chatWindow = document.createElement('iframe');
  chatWindow.className = 'chatkit-window';
  chatWindow.id = instanceId;
  chatWindow.src = config.baseUrl;
  chatWindow.setAttribute('title', 'Chat Widget');
  chatWindow.setAttribute('allow', 'microphone; camera');

  // Create overlay (optional)
  const overlay = document.createElement('div');
  overlay.className = 'chatkit-overlay';

  // State
  let isOpen = false;

  // Toggle chat window
  function toggleChat() {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  function openChat() {
    isOpen = true;
    chatWindow.classList.add('open');
    chatWindow.classList.remove('closing');
    button.innerHTML = '✕';
    button.setAttribute('aria-label', 'Close chat');
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.add('closing');
    chatWindow.classList.remove('open');
    button.innerHTML = config.buttonText;
    button.setAttribute('aria-label', 'Open chat');

    // Remove 'closing' class after animation
    setTimeout(() => {
      chatWindow.classList.remove('closing');
    }, 300);
  }

  // Event listeners
  button.addEventListener('click', toggleChat);
  overlay.addEventListener('click', closeChat);

  // Handle escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) {
      closeChat();
    }
  });

  // Append elements when DOM is ready
  function init() {
    if (config.position === 'inline') {
      // For inline mode, find target element
      const targetId = config.targetElement || 'chatkit-container';
      const target = document.getElementById(targetId);
      if (target) {
        const inlineFrame = document.createElement('iframe');
        inlineFrame.className = 'chatkit-inline';
        inlineFrame.src = config.baseUrl;
        inlineFrame.setAttribute('title', 'Chat Widget');
        inlineFrame.setAttribute('allow', 'microphone; camera');
        target.appendChild(inlineFrame);
      } else {
        console.error('ChatKit: Target element not found:', targetId);
      }
    } else {
      // For floating mode
      document.body.appendChild(overlay);
      document.body.appendChild(button);
      document.body.appendChild(chatWindow);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for programmatic control
  window.ChatKitWidget = {
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
    isOpen: function() { return isOpen; }
  };

})();
