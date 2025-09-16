// Social Authentication Service
class SocialAuthService {
  constructor() {
    // Google Client ID - using your real credentials
    this.googleClientId = '630450799439-orkmqjnrlkcjhbmhhdv8hb263nl2ddmp.apps.googleusercontent.com';
    
    console.log('Google Client ID:', this.googleClientId);
  }
  
  // Google OAuth Configuration
  async initializeGoogleAuth() {
    return new Promise((resolve, reject) => {
      // Load Google OAuth script
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
          try {
            window.google.accounts.id.initialize({
              client_id: this.googleClientId,
              callback: this.handleGoogleCredentialResponse.bind(this),
              auto_select: false,
              cancel_on_tap_outside: true
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        script.onerror = () => reject(new Error('Failed to load Google OAuth script'));
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  }

  // Handle Google Credential Response
  handleGoogleCredentialResponse(response) {
    try {
      // Decode JWT token (in production, validate on backend)
      const token = response.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        provider: 'google'
      };
    } catch (error) {
      console.error('Error parsing Google credential:', error);
      throw new Error('Failed to parse Google credential');
    }
  }

  // Google Sign In
  async signInWithGoogle() {
    try {
      console.log('Starting Google sign in...');
      await this.initializeGoogleAuth();
      console.log('Google OAuth initialized successfully');
      
      return new Promise((resolve, reject) => {
        try {
          console.log('Creating Google token client...');
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: this.googleClientId,
            scope: 'email profile',
            callback: (response) => {
              console.log('Google OAuth response:', response);
              if (response.error) {
                reject(new Error(response.error));
              } else {
                // Get user info with access token
                this.getGoogleUserInfo(response.access_token)
                  .then(resolve)
                  .catch(reject);
              }
            }
          });
          
          console.log('Requesting access token...');
          tokenClient.requestAccessToken();
        } catch (error) {
          console.error('Error creating token client:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Google sign in error:', error);
      throw new Error('Failed to initialize Google OAuth: ' + error.message);
    }
  }

  // Get Google User Info
  async getGoogleUserInfo(accessToken) {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
      const userInfo = await response.json();
      
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        provider: 'google'
      };
    } catch (error) {
      throw new Error('Failed to get Google user info');
    }
  }

  // Facebook Login
  async signInWithFacebook() {
    return new Promise((resolve, reject) => {
      // Load Facebook SDK
      if (!window.FB) {
        this.loadFacebookSDK().then(() => {
          this.performFacebookLogin(resolve, reject);
        });
      } else {
        this.performFacebookLogin(resolve, reject);
      }
    });
  }

  // Load Facebook SDK
  loadFacebookSDK() {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.onload = () => {
        window.FB.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID || 
                window.REACT_APP_FACEBOOK_APP_ID || 
                '1234567890123456', // Demo fallback
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  // Perform Facebook Login
  performFacebookLogin(resolve, reject) {
    window.FB.login((response) => {
      if (response.authResponse) {
        // Get user info
        window.FB.api('/me', { fields: 'id,name,email,picture' }, (userInfo) => {
          resolve({
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture?.data?.url,
            provider: 'facebook'
          });
        });
      } else {
        reject(new Error('Facebook login was cancelled'));
      }
    }, { scope: 'email' });
  }

  // Demo function - simulate social login for development
  async demoSocialLogin(provider) {
    // This is for demo purposes - returns mock data
    const mockUsers = {
      google: {
        id: 'google_user_123',
        email: 'user@gmail.com',
        name: 'Google User',
        picture: 'https://via.placeholder.com/150',
        provider: 'google'
      },
      facebook: {
        id: 'facebook_user_123',
        email: 'user@facebook.com',
        name: 'Facebook User',
        picture: 'https://via.placeholder.com/150',
        provider: 'facebook'
      }
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockUsers[provider]);
      }, 1000);
    });
  }
}

export default new SocialAuthService();
