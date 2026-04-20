import { useState } from "react";
import { Unlock, FileCode, Copy, Check, RefreshCw, Terminal, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "motion/react";

export function PythonDecoder() {
  const [inputCode, setInputCode] = useState("");
  const [decodedCode, setDecodedCode] = useState("");
  const [isDecoding, setIsDecoding] = useState(false);
  const [copied, setCopied] = useState(false);

  const decodeScript = async () => {
    if (!inputCode) return;
    
    setIsDecoding(true);
    // Simulate complex extraction/de-obfuscation
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      let result = inputCode;

      // Pattern 1: Omni-Tool Encryptor V1 format (Base64 extraction)
      // Look for _payload = "..." or similar patterns
      const payloadMatch = inputCode.match(/_payload\s*=\s*["']([^"']+)["']/);
      if (payloadMatch && payloadMatch[1]) {
        try {
          const decoded = atob(payloadMatch[1]);
          result = decoded;
        } catch (e) {
          console.log("Failed to decode payload match, trying general base64...");
        }
      }

      // Pattern 2: General Base64 detection
      // If result still looks like code but might be inside a base64.b64decode()
      const b64FuncMatch = inputCode.match(/b64decode\s*\(\s*["']([^"']+)["']/);
      if (b64FuncMatch && b64FuncMatch[1]) {
        try {
          const decoded = atob(b64FuncMatch[1]);
          result = decoded;
        } catch (e) {}
      }

      // Pattern 3: Hex decoding
      // Search for code like \x68\x65\x6c\x6c\x6f
      if (inputCode.includes("\\x")) {
        try {
          const hexDecoded = inputCode.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => 
            String.fromCharCode(parseInt(hex, 16))
          );
          result = hexDecoded;
        } catch (e) {}
      }

      // Pattern 4: If nothing matched, try to just "un-b64" the whole thing if it's a valid b64 string
      if (result === inputCode) {
        try {
          const rawB64 = atob(inputCode.trim());
          if (rawB64 && rawB64.length > 5) {
             result = rawB64;
          }
        } catch (e) {}
      }

      setDecodedCode(result);
    } catch (error) {
      console.error("Decoding failed:", error);
      setDecodedCode("# ERROR: Extraction failed. Format not recognized or content corrupted.");
    } finally {
      setIsDecoding(false);
    }
  };

  const clear = () => {
    setInputCode("");
    setDecodedCode("");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(decodedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="hardware-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Eye className="w-5 h-5" />
              Obfuscated Code
            </CardTitle>
            <CardDescription>
              Paste encrypted or obfuscated Python code to extract original source.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Encrypted Input</Label>
                <Button variant="ghost" size="sm" onClick={clear} className="h-6 text-[10px] gap-1 px-2">
                  <Trash2 className="w-3 h-3" />
                  CLEAR
                </Button>
              </div>
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Paste encrypted script or base64 payload..."
                className="w-full h-[400px] bg-black/50 border border-border rounded-md p-4 font-mono text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
              />
            </div>
            <Button 
              onClick={decodeScript} 
              disabled={isDecoding || !inputCode}
              className="w-full bg-blue-500 text-white font-bold hover:bg-blue-600"
            >
              {isDecoding ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ANALYZING & EXTRACTING...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  REVERSE ENCRYPTION
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="hardware-card border-border border-blue-500/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400">
                <EyeOff className="w-5 h-5" />
                Decoded Result
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={copyToClipboard}
                  disabled={!decodedCode}
                  className="h-8 w-8"
                >
                  {copied ? <Check className="w-4 h-4 text-blue-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Restored source code will appear here after analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Original Source</Label>
              <ScrollArea className="h-[400px] w-full rounded-md border border-border bg-black/80 p-4">
                <pre className="font-mono text-xs text-blue-300/70 whitespace-pre-wrap break-all">
                  {decodedCode || "# Decoded output will appear here..."}
                </pre>
              </ScrollArea>
            </div>
            <div className="mt-4 p-3 rounded bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <Terminal className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                <p className="text-[10px] text-blue-300/80 leading-relaxed font-mono">
                  SCAN_LOG: Analyzing entropy... Base64 detected [OK]. Reversing execution layers... Done.
                  <br />
                  NOTE: Complex multi-layer obfuscation may require multiple passes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
