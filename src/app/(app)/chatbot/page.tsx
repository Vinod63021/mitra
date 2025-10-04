
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { sendMessageToMitraAction } from './actions';
import Image from 'next/image';
import { SectionTitle } from '@/components/SectionTitle';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { id: 'initial-greeting', sender: 'bot', text: "Hi there! I'm Mitra, your PCOS assistant. How can I help you today?" }
      ]);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text: inputValue.trim(),
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    const result = await sendMessageToMitraAction(newUserMessage.text);
    setIsLoading(false);

    if (result.success && result.response) {
      const newBotMessage: Message = {
        id: Date.now().toString() + '-bot',
        sender: 'bot',
        text: result.response,
      };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Could not get a response from Mitra. Please try again.',
        variant: 'destructive',
      });
      const errorBotMessage: Message = {
        id: Date.now().toString() + '-bot-error',
        sender: 'bot',
        text: "I'm sorry, I encountered an issue. Please try asking again in a moment.",
      };
      setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
    }
  };

  return (
    <div className="container mx-auto py-8 h-full flex flex-col">
       <SectionTitle
        title="Chat with Mitra"
        description="Ask questions about PCOS, app features, or general wellness. Mitra is here to support you."
        icon={Bot}
      />
      <Card className="flex-grow flex flex-col shadow-lg">
        <CardContent className="flex-grow p-0 overflow-hidden">
            <ScrollArea ref={scrollAreaRef} className="h-full p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-end gap-2 text-sm',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.sender === 'bot' && (
                     <Image src="https://placehold.co/32x32.png?text=M" alt="Mitra" width={32} height={32} className="rounded-full flex-shrink-0" data-ai-hint="bot avatar"/>
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-xl px-3 py-2 shadow',
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-accent/20 text-accent-foreground rounded-bl-none border border-primary/20'
                    )}
                  >
                    {message.text.split('\n').map((line, i) => (<React.Fragment key={i}>{line}<br/></React.Fragment>))}
                  </div>
                   {message.sender === 'user' && (
                     <User className="h-6 w-6 text-muted-foreground rounded-full flex-shrink-0 p-0.5 bg-muted" />
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2 text-sm justify-start">
                  <Image src="https://placehold.co/32x32.png?text=M" alt="Mitra" width={32} height={32} className="rounded-full flex-shrink-0" data-ai-hint="bot avatar"/>
                  <div className="max-w-[75%] rounded-xl px-3 py-2 shadow bg-accent/20 text-accent-foreground rounded-bl-none border border-primary/20">
                    <div className="flex items-center space-x-1">
                        <Loader2 className="h-4 w-4 animate-spin text-primary/80" />
                        <span className="text-xs text-muted-foreground">Mitra is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
        </CardContent>
        <CardFooter className="p-3 border-t border-primary/20 bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              type="text"
              placeholder="Ask Mitra anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-grow"
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={isLoading || inputValue.trim() === ''} className="bg-primary hover:bg-primary/90">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
