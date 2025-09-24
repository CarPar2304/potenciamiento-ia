import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { TypingIndicator } from './TypingIndicator';
import { MessageFormatter } from './MessageFormatter';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onClose: () => void;
}

export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! ¿En qué puedo ayudarte?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar configuración de webhook
  useEffect(() => {
    const loadWebhookConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('webhook_config')
          .select('url')
          .eq('name', 'VisorIA Chat')
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading webhook config:', error);
          return;
        }

        if (data?.url) {
          setWebhookUrl(data.url);
        }
      } catch (error) {
        console.error('Error loading webhook config:', error);
      }
    };

    loadWebhookConfig();
  }, []);

  // Auto scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!webhookUrl) {
      toast({
        title: "Configuración requerida",
        description: "VisorIA no está configurado. Ve a Ajustes para configurar el webhook.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          timestamp: userMessage.timestamp.toISOString(),
          userId: 'anonymous', // Podrías usar el ID del usuario autenticado
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Simular delay de escritura
      await new Promise(resolve => setTimeout(resolve, 1000));

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || data.message || 'Respuesta recibida',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con VisorIA. Verifica la configuración en Ajustes.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-foreground">VisorIA</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-muted text-muted-foreground mr-4'
                }`}
              >
                {message.isUser ? (
                  <p className="text-sm">{message.text}</p>
                ) : (
                  <MessageFormatter message={message.text} />
                )}
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-muted text-muted-foreground p-3 rounded-lg mr-4">
                <TypingIndicator />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={isTyping}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={isTyping || !inputValue.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}