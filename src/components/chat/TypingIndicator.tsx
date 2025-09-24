export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-muted-foreground">Escribiendo</span>
      <div className="flex gap-1">
        <div 
          className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
          style={{ animationDelay: '0ms', animationDuration: '1s' }}
        ></div>
        <div 
          className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
          style={{ animationDelay: '200ms', animationDuration: '1s' }}
        ></div>
        <div 
          className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
          style={{ animationDelay: '400ms', animationDuration: '1s' }}
        ></div>
      </div>
    </div>
  );
}