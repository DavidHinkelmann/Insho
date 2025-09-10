import SuperTokens from "supertokens-auth-react";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import ThirdParty, { Google } from "supertokens-auth-react/recipe/thirdparty";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";

// Initialise SuperTokens once at app startup
export function initSuperTokens() {
  const appName = import.meta.env.VITE_APP_NAME ?? "Insho";
  const websiteDomain = import.meta.env.VITE_WEBSITE_DOMAIN ?? window.location.origin;
  const apiDomain = import.meta.env.VITE_API_DOMAIN ?? "http://localhost:8000";
  const apiBasePath = import.meta.env.VITE_API_BASE_PATH ?? "/auth"; // backend auth API base path
  const websiteBasePath = import.meta.env.VITE_WEBSITE_BASE_PATH ?? "/auth"; // where prebuilt UI will be mounted in the frontend

  // Prevent re-init in HMR
  if ((SuperTokens as any)._initCalled) return;

  SuperTokens.init({
    appInfo: {
      appName,
      apiDomain,
      websiteDomain,
      apiBasePath,
      websiteBasePath,
    },
    recipeList: [
      ThirdParty.init({
        signInAndUpFeature: {
          providers: [
            Google.init(),
            // Add more providers here if needed
          ],
        },
      }),
      EmailPassword.init(),
      Session.init(),
    ],
  });

  // Mark as initialised (for Vite HMR)
  (SuperTokens as any)._initCalled = true;
}

export { SessionAuth };
