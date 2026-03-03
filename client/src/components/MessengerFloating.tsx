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
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-primary p-4 flex justify-between items-center text-white">
            <h3 className="font-semibold">Message চন্দ্রাবতী</h3>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-80">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 bg-gray-50 h-48 overflow-y-auto flex flex-col justify-end">
            <p className="bg-gray-200 text-gray-700 p-3 rounded-2xl rounded-bl-none text-sm self-start max-w-[80%]">
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
            <Button size="icon" onClick={handleSend} className="bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white animate-bounce"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      )}
    </div>
  );
}
