import React from 'react';

interface MessageFormatterProps {
  message: string;
}

export function MessageFormatter({ message }: MessageFormatterProps) {
  // Función para formatear texto con markdown básico
  const formatMessage = (text: string) => {
    let formatted = text;

    // Detectar y formatear tablas markdown
    const tableRegex = /(\|[^\n]+\|[\r\n]+)((?:\|[-:\s]+\|[\r\n]+)?)((?:\|[^\n]+\|[\r\n]*)+)/g;
    formatted = formatted.replace(tableRegex, (match) => {
      const lines = match.trim().split(/[\r\n]+/);
      if (lines.length < 2) return match;

      // Primera línea = headers
      const headers = lines[0].split('|').filter(cell => cell.trim() !== '').map(h => h.trim());
      
      // Segunda línea puede ser separador (|---|---|)
      let startDataRow = 1;
      if (lines[1] && /^\|[\s-:|]+\|$/.test(lines[1].trim())) {
        startDataRow = 2;
      }

      // Resto = datos
      const rows = lines.slice(startDataRow).map(line => 
        line.split('|').filter(cell => cell.trim() !== '').map(c => c.trim())
      );

      let tableHTML = '<div class="overflow-x-auto my-3"><table class="min-w-full border-collapse border border-border rounded-lg overflow-hidden">';
      
      // Headers
      tableHTML += '<thead class="bg-muted"><tr>';
      headers.forEach(header => {
        tableHTML += `<th class="border border-border px-3 py-2 text-left text-sm font-semibold">${header}</th>`;
      });
      tableHTML += '</tr></thead>';

      // Body
      tableHTML += '<tbody>';
      rows.forEach((row, idx) => {
        tableHTML += `<tr class="${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}">`;
        row.forEach(cell => {
          tableHTML += `<td class="border border-border px-3 py-2 text-sm">${cell}</td>`;
        });
        tableHTML += '</tr>';
      });
      tableHTML += '</tbody></table></div>';

      return tableHTML;
    });
    
    // Convertir saltos de línea
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Formatear **negrita**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Formatear *cursiva*
    formatted = formatted.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>');
    
    // Formatear enlaces [texto](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
    
    // Formatear URLs automáticamente
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline break-all">$1</a>'
    );
    
    // Formatear listas con -
    formatted = formatted.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
    formatted = formatted.replace(/(<li[^>]*>.*<\/li>)/gs, '<ul class="space-y-1">$1</ul>');
    
    // Formatear listas numeradas
    formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');
    formatted = formatted.replace(/(<li[^>]*>.*<\/li>)/gs, '<ol class="space-y-1">$1</ol>');
    
    // Formatear código inline `código`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Formatear bloques de código ```código```
    formatted = formatted.replace(
      /```([^`]+)```/g, 
      '<pre class="bg-muted p-2 rounded text-sm font-mono overflow-x-auto mt-2"><code>$1</code></pre>'
    );
    
    return formatted;
  };

  return (
    <div 
      className="prose prose-sm max-w-none text-inherit"
      dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
    />
  );
}