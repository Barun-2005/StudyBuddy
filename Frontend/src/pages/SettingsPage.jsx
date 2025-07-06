import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send, Image, Star, X } from "lucide-react";

const PREVIEW_MESSAGES = [
  { 
    id: 1, 
    content: "Hey! Would you like to study together?", 
    isSent: false,
    time: "10:30 AM",
    user: {
      name: "Sarah Parker",
      profilePic: "/avatar.png",
      rating: 4.5
    }
  },
  { 
    id: 2, 
    content: "Sure! Here's what I'm working on right now!", 
    isSent: true,
    time: "10:31 AM",
    hasImage: true,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=300&auto=format&fit=crop"
  },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl pb-8">
      <div className="space-y-8">
        {/* Theme Selection Section */}
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Theme</h2>
            <p className="text-sm text-base-content/70">Choose a theme for your chat interface</p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`
                  group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                  ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}
                `}
                onClick={() => setTheme(t)}
              >
                <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                </div>
                <span className="text-[11px] font-medium truncate w-full text-center">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Preview</h2>
            <p className="text-sm text-base-content/70">See how your messages will look with the selected theme</p>
          </div>

          <div className="border border-base-300 rounded-xl overflow-hidden shadow-sm">
            {/* Chat Header */}
            <div className="bg-base-200 p-3 border-b border-base-300 flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src="/avatar.png" alt="Chat partner" className="object-cover" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Sarah Parker</h3>
                  <div className="flex items-center gap-1 bg-warning/10 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 text-warning fill-warning" />
                    <span className="text-xs font-medium">4.5</span>
                  </div>
                </div>
                <p className="text-xs text-base-content/70">Online</p>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="p-4 space-y-4 bg-base-100 min-h-[300px] flex flex-col">
              <div className="flex-1 space-y-4">
                {PREVIEW_MESSAGES.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat ${msg.isSent ? "chat-end" : "chat-start"}`}
                  >
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full">
                        <img src="/avatar.png" alt="Avatar" />
                      </div>
                    </div>
                    <div className={`chat-bubble ${
                      msg.isSent ? "chat-bubble-primary" : ""
                    } shadow-sm`}>
                      {msg.content}
                    </div>
                    <div className="chat-footer opacity-70 text-xs flex gap-1">
                      {msg.time}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-base-300 bg-base-100">
                {/* Image Preview */}
                <div className="mb-3 flex items-center gap-2">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=300&auto=format&fit=crop"
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-base-300"
                    />
                    <button
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                      flex items-center justify-center"
                      type="button"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-circle btn-ghost btn-sm">
                    <Image className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="input input-bordered flex-1"
                    disabled
                  />
                  <button className="btn btn-primary btn-circle">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;




