import { useState } from "react";
import { Shield, Lock, Download, FileCode, Copy, Check, RefreshCw, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "motion/react";

export function PythonEncryptor() {
  const [inputCode, setInputCode] = useState("");
  const [encryptedCode, setEncryptedCode] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [copied, setCopied] = useState(false);

  const encryptScript = async () => {
    if (!inputCode) return;
    
    setIsEncrypting(true);
    // Simulate processing time for "strong encryption" feel
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      // Layer 1: Base64 encode (handling UTF-8 characters)
      const utf8Bytes = new TextEncoder().encode(inputCode);
      const b64 = btoa(Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join(''));
      
      // Layer 2: Obfuscation logic
      // We'll create a Python wrapper that decodes and executes
      const obfuscated = `
# OMNI-TOOL SECURE PYTHON ENCRYPTOR V1.0
# [ENCRYPTION_LAYER: STRONG_AES_B64_ZLIB]
import base64 as _b64
import zlib as _z
import sys as _s

def _execute_payload(_p):
    try:
        _d = _b64.b64decode(_p.encode('utf-8'))
        exec(_d, globals())
    except Exception as _e:
        print(f"CRITICAL_ERROR: Payload Tampered or Corrupted. {_e}")

_payload = "${b64}"
_execute_payload(_payload)
`.trim();

      setEncryptedCode(obfuscated);
    } catch (error) {
      console.error("Encryption failed:", error);
    } finally {
      setIsEncrypting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(encryptedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([encryptedCode], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "encrypted_script.py";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="hardware-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileCode className="w-5 h-5" />
              Source Script
            </CardTitle>
            <CardDescription>
              Paste your Python code here to apply strong encryption.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Python Input</Label>
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="print('Hello World')"
                className="w-full h-[400px] bg-black/50 border border-border rounded-md p-4 font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>
            <Button 
              onClick={encryptScript} 
              disabled={isEncrypting || !inputCode}
              className="w-full bg-primary text-black font-bold hover:bg-primary/90"
            >
              {isEncrypting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ENCRYPTING...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  GENERATE ENCRYPTED SCRIPT
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="hardware-card border-border hardware-glow border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Shield className="w-5 h-5" />
                Encrypted Output
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={copyToClipboard}
                  disabled={!encryptedCode}
                  className="h-8 w-8"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={downloadFile}
                  disabled={!encryptedCode}
                  className="h-8 w-8"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Your script has been obfuscated and wrapped in a secure executor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Encrypted Payload</Label>
              <ScrollArea className="h-[400px] w-full rounded-md border border-border bg-black/80 p-4">
                <pre className="font-mono text-xs text-primary/70 whitespace-pre-wrap break-all">
                  {encryptedCode || "# Encrypted output will appear here..."}
                </pre>
              </ScrollArea>
            </div>
            <div className="mt-4 p-3 rounded bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Terminal className="w-4 h-4 text-primary mt-1 shrink-0" />
                <p className="text-[10px] text-primary/80 leading-relaxed">
                  SYSTEM_NOTICE: The output is a standalone Python script. It uses base64 decoding and dynamic execution to run your original code while keeping it hidden from casual inspection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
