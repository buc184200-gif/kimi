import { Button } from "@/components/ui/button";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-[18px] font-semibold tracking-[0.22em] mb-2">NOIR THREADS</h1>
          <p className="text-[13px] text-black/50">Sign in to access your account</p>
        </div>
        <Button
          className="w-full h-12 bg-black text-white text-[12px] font-medium tracking-[0.1em] hover:bg-black/90 rounded-none"
          onClick={() => {
            window.location.href = getOAuthUrl();
          }}
        >
          SIGN IN WITH KIMI
        </Button>
        <p className="text-center text-[11px] text-black/40 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
