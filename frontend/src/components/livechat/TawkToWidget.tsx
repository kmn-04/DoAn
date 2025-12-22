import { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';

/**
 * Tawk.to Live Chat Widget Component
 * 
 * This component loads the Tawk.to live chat widget script and sets visitor attributes
 * to identify each user separately. This ensures that each logged-in user has their
 * own chat history and session.
 * 
 * Features:
 * - Free tier available
 * - Real-time chat with support staff
 * - Can work alongside AI chatbot
 * - Mobile responsive
 * - Visitor identification per user
 */
/**
 * Generate MD5-like hash from string (simple implementation)
 * Tawk.to uses hash to uniquely identify visitors
 */
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

const TawkToWidget: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  // Load Tawk.to script
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="embed.tawk.to"]')) {
      return;
    }

    // Initialize Tawk.to
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Set onLoad callback before loading script
    // Visitor hash will be set by the second useEffect when user logs in
    window.Tawk_API.onLoad = function() {
      console.log('[Tawk.to] Widget loaded, waiting for visitor identification...');
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/6931076418fa5f197d7ea5d7/1jbjo9ovj';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }

    // Cleanup function
    return () => {
      // Optional: Hide Tawk.to widget on unmount if needed
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    };
  }, []);

  // Set visitor attributes when user logs in or changes
  useEffect(() => {
    console.log('[Tawk.to] useEffect triggered - User:', user?.email, 'Authenticated:', isAuthenticated);
    
    // Wait a bit for Tawk.to to be ready
    const checkAndSetAttributes = () => {
      console.log('[Tawk.to] Checking if widget is ready...');
      
      if (!window.Tawk_API) {
        console.log('[Tawk.to] Tawk_API not found, retrying...');
        setTimeout(checkAndSetAttributes, 200);
        return;
      }

      console.log('[Tawk_API available]', {
        hasVisitor: typeof window.Tawk_API.visitor !== 'undefined',
        hasSetAttributes: typeof window.Tawk_API.setAttributes === 'function',
        visitor: window.Tawk_API.visitor
      });

      // Check if Tawk.to is ready (has visitor property accessible or setAttributes method)
      if (typeof window.Tawk_API.visitor !== 'undefined' || typeof window.Tawk_API.setAttributes === 'function') {
        if (user && isAuthenticated) {
          console.log('[Tawk.to] Setting visitor attributes for user:', user.email);
          setVisitorAttributes(user);
          
          // CRITICAL: After setting hash, we may need to reload the widget
          // to ensure Tawk.to recognizes the new visitor identity
          setTimeout(() => {
            if (window.Tawk_API && window.Tawk_API.reload) {
              console.log('[Tawk.to] Reloading widget to apply new visitor hash...');
              window.Tawk_API.reload();
            }
          }, 1000);
        } else {
          console.log('[Tawk.to] User not logged in, resetting visitor attributes');
          // Reset visitor when user logs out
          resetVisitorAttributes();
          
          // Clear Tawk.to cookies/localStorage to reset visitor session
          try {
            // Clear Tawk.to cookies
            document.cookie.split(";").forEach((c) => {
              if (c.trim().startsWith('Tawk_')) {
                const cookieName = c.trim().split("=")[0];
                document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
              }
            });
            console.log('[Tawk.to] Cleared Tawk.to cookies');
          } catch (e) {
            console.warn('[Tawk.to] Could not clear cookies:', e);
          }
        }
      } else {
        // If not ready yet, try again after a short delay
        console.log('[Tawk.to] Widget not ready yet, retrying...');
        setTimeout(checkAndSetAttributes, 200);
      }
    };

    // Small delay to ensure Tawk.to script is loaded
    const timeoutId = setTimeout(checkAndSetAttributes, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, isAuthenticated]);

  return null; // This component doesn't render anything
};

/**
 * Set Tawk.to visitor attributes to identify the user uniquely
 * CRITICAL: The hash MUST be set in visitor object BEFORE setting attributes
 * Tawk.to uses the hash to link chat sessions to the same visitor
 */
const setVisitorAttributes = (user: { id: number; name: string; email: string; phone?: string }) => {
  console.log('[Tawk.to] setVisitorAttributes called for user:', user.email, user.id);
  
  if (!window.Tawk_API) {
    console.error('[Tawk.to] Tawk_API is not available');
    return;
  }

  try {
    // Generate unique hash from user ID - this is the key to separate chat histories
    const hash = simpleHash(`tourbooking_${user.id}_${user.email}`);
    console.log(`[Tawk.to] Generated hash for user ${user.email}: ${hash}`);

    // CRITICAL STEP 1: Set visitor hash FIRST - this is what Tawk.to uses for identification
    // Must set visitor.hash before any other operations
    if (!window.Tawk_API.visitor) {
      window.Tawk_API.visitor = {};
      console.log('[Tawk.to] Created visitor object');
    }
    
    window.Tawk_API.visitor = {
      name: user.name,
      email: user.email,
      hash: hash // This hash uniquely identifies this visitor - each user gets different hash
    };

    console.log(`[Tawk.to] ✅ Visitor hash set:`, {
      name: user.name,
      email: user.email,
      hash: hash,
      visitor: window.Tawk_API.visitor
    });

    // STEP 2: Set additional attributes (optional - not critical for visitor identification)
    // Note: Tawk.to may not accept email in setAttributes, so we only set name and userId
    // The hash in visitor object is the KEY to identify unique visitors
    if (window.Tawk_API.setAttributes) {
      console.log('[Tawk.to] Calling setAttributes...');
      // Only set name and userId - email is already in visitor object
      window.Tawk_API.setAttributes({
        name: user.name,
        userId: user.id.toString(),
        phone: user.phone || '',
      }, (error?: Error | string) => {
        if (error) {
          // Don't treat as critical error - hash in visitor object is what matters
          console.warn('[Tawk.to] ⚠️ Warning setting attributes (non-critical):', error);
          console.log('[Tawk.to] ✅ Visitor hash is still set correctly:', hash);
        } else {
          console.log(`[Tawk.to] ✅ Visitor attributes set successfully for: ${user.email} (hash: ${hash})`);
          if (window.Tawk_API) {
            console.log('[Tawk.to] Current visitor state:', window.Tawk_API.visitor);
          }
        }
      });
    } else {
      console.warn('[Tawk.to] setAttributes method not available - visitor hash should still work');
    }

    // Log visitor state after a short delay to verify
    setTimeout(() => {
      if (window.Tawk_API) {
        console.log('[Tawk.to] Visitor state after 500ms:', window.Tawk_API.visitor);
      }
    }, 500);
    
  } catch (error) {
    console.error('[Tawk.to] ❌ Exception in setVisitorAttributes:', error);
  }
};

/**
 * Reset visitor attributes when user logs out
 */
const resetVisitorAttributes = () => {
  if (!window.Tawk_API) return;

  try {
    console.log('[Tawk.to] Resetting visitor attributes...');
    
    // Clear visitor attributes
    if (window.Tawk_API.setAttributes) {
      window.Tawk_API.setAttributes({}, () => {
        console.log('[Tawk.to] Visitor attributes reset');
      });
    }

    // Reset visitor object and hash - this makes it an anonymous visitor
    if (window.Tawk_API.visitor) {
      window.Tawk_API.visitor = {
        name: '',
        email: '',
        hash: '' // Empty hash = anonymous visitor
      };
    }

    // Clear Tawk.to cookies to reset session
    try {
      document.cookie.split(";").forEach((c) => {
        if (c.trim().startsWith('Tawk_')) {
          const cookieName = c.trim().split("=")[0];
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        }
      });
      console.log('[Tawk.to] Cleared Tawk.to cookies');
    } catch (e) {
      console.warn('[Tawk.to] Could not clear cookies:', e);
    }

    // Reload to apply changes
    if (window.Tawk_API.reload) {
      window.Tawk_API.reload();
    }
  } catch (error) {
    console.error('[Tawk.to] Error resetting visitor:', error);
  }
};

// Extend Window interface to include Tawk.to API
declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      maximize?: () => void;
      minimize?: () => void;
      toggle?: () => void;
      onLoad?: () => void;
      reload?: () => void;
      setAttributes?: (attributes: Record<string, string>, callback?: (error?: Error | string) => void) => void;
      visitor?: {
        name?: string;
        email?: string;
        hash?: string;
      };
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
  }
}

export default TawkToWidget;

