import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MessengerFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://www.facebook.com/messages/t/61584594611053/?text=${encodedMessage}`, "_blank");
    setMessage("");
    setIsOpen(false);
  };

  return (
    /* flex-col and items-end keeps everything aligned to the right side */
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[100] flex flex-col items-end gap-4">

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-primary p-4 flex justify-between items-center text-white">
            <h3 className="font-semibold text-sm">Message চন্দ্রাবতী</h3>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-80 transition-opacity">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 bg-gray-50 h-48 overflow-y-auto flex flex-col justify-end">
            <p className="bg-gray-200 text-gray-700 p-3 rounded-2xl rounded-bl-none text-sm self-start max-w-[85%]">
              Hello! How can we help you today?
            </p>
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSend} className="bg-primary hover:bg-primary/90 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <Button
          size="icon"
          /* Removed animate-bounce to stop the jumping. Added hover:scale-110 for a subtle effect instead. */
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white transition-transform hover:scale-110 active:scale-95"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      )}
    </div>
  );
}