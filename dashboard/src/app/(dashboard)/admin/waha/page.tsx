"use client";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/Dialog";
import { Input } from "@/components/Input";
import { useWahaStatus } from "@/hooks/use-automation";
import {
    Loader2,
    LogOut,
    MessageSquare,
    QrCode,
    Settings,
    Shield,
    Smartphone
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";


export default function WahaPage() {
  const { status, session, qrCodeUrl, connect, disconnect, sendMessage } = useWahaStatus();
  

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Hello from Dashboard!");
  const [sending, setSending] = useState(false);


  const getStatusBadge = () => {
      switch (status) {
          case 'WORKING':
              return <Badge variant="success">Active</Badge>;
          case 'SCAN_QR_CODE':
              return <Badge variant="warning">Scan QR</Badge>;
          default:
              return <Badge variant="error">Disconnected</Badge>;
      }
  };

  const handleConnect = () => connect();
  const handleDisconnect = () => {
      disconnect();
      setIsDisconnectOpen(false);
  };

  const handleSendMessage = async () => {
      if (!testPhone || !testMessage) return;
      setSending(true);
      await sendMessage(testPhone, testMessage);
      setSending(false);
      setIsDialogOpen(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">WhatsApp Server</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your automation sessions and connectivity.</p>
          </div>
          <div className="flex items-center gap-2">
               {getStatusBadge()}
               {status === 'WORKING' && (
                   <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                       <Shield size={14} /> Encrypted
                   </span>
               )}
          </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          

          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Smartphone size={20} />
                  </div>
                  <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-50">Primary Gateway</h3>
                      <p className="text-xs text-gray-500">Default Session</p>
                  </div>
              </div>
              <Button variant="ghost" className="text-gray-400 p-2 aspect-square">
                  <Settings size={18} />
              </Button>
          </div>


          <div className="p-6 md:p-8">
              {status === 'SCAN_QR_CODE' ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-8">
                      <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-2xl blur opacity-20 animate-pulse"></div>
                          <div className="relative bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-64 h-64 flex items-center justify-center">
                              {qrCodeUrl ? (
                                <Image 
                                    src={qrCodeUrl} 
                                    alt="Scan QR" 
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                              ) : (
                                <div className="flex flex-col items-center gap-3 text-gray-400">
                                     <Loader2 className="animate-spin text-emerald-500" size={32} />
                                     <span className="text-xs font-medium uppercase tracking-wide">Generating QR</span>
                                </div>
                              )}
                          </div>
                      </div>
                      
                      <div className="text-center max-w-xs space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Link Device</h3>
                          <p className="text-sm text-gray-500">
                            Open WhatsApp &gt; Settings &gt; Linked Devices &gt; <strong>Link a Device</strong> and scan the code above.
                          </p>
                      </div>
                  </div>
              ) : status === 'WORKING' ? (
                 
                  <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                           <div className="grid sm:grid-cols-3 gap-4">
                               <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-medium">Account ID</p>
                                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-200 truncate">
                                        {session?.me?.id ? session.me.id.split('@')[0] : session?.me || "Unknown"}
                                    </p>
                               </div>
                               <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-medium">Platform</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                        {session?.platform || "WhatsApp Business"}
                                    </p>
                               </div>
                               <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-medium">Push Name</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                                        {session?.pushname || "My Account"}
                                    </p>
                               </div>
                           </div>

                           <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                               <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                   <DialogTrigger asChild>
                                       <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none border-0">
                                           <MessageSquare size={18} className="mr-2" />
                                           Send Test Message
                                       </Button>
                                   </DialogTrigger>
                                   <DialogContent className="sm:max-w-[425px]">
                                       <DialogHeader>
                                           <DialogTitle>Send Test Message</DialogTitle>
                                           <DialogDescription>
                                               Verify your connection by sending a message.
                                           </DialogDescription>
                                       </DialogHeader>
                                       <div className="grid gap-4 py-4">
                                           <div className="space-y-2">
                                               <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                   Phone Number
                                               </label>
                                               <Input
                                                   placeholder="628123456789"
                                                   value={testPhone}
                                                   onChange={(e) => setTestPhone(e.target.value)}
                                               />
                                               <p className="text-[0.8rem] text-gray-500">
                                                   Enter the number with country code (no +).
                                               </p>
                                           </div>
                                           <div className="space-y-2">
                                               <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                   Message
                                               </label>
                                               <Input
                                                   placeholder="Type your message..."
                                                   value={testMessage}
                                                   onChange={(e) => setTestMessage(e.target.value)}
                                               />
                                           </div>
                                       </div>
                                       <DialogFooter>
                                           <Button 
                                               type="submit" 
                                               onClick={handleSendMessage}
                                               isLoading={sending}
                                               disabled={!testPhone || !testMessage}
                                               className="w-full sm:w-auto"
                                           >
                                               Send Message
                                           </Button>
                                       </DialogFooter>
                                   </DialogContent>
                               </Dialog>

                               <Dialog open={isDisconnectOpen} onOpenChange={setIsDisconnectOpen}>
                                   <DialogTrigger asChild>
                                        <Button 
                                            variant="destructive" 
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 dark:shadow-none border-0"
                                        >
                                            <LogOut size={18} className="mr-2" />
                                            Disconnect Session
                                        </Button>
                                   </DialogTrigger>
                                   <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Disconnect Session?</DialogTitle>
                                            <DialogDescription>
                                                This will stop the WhatsApp automation service. You will need to re-scan the QR code to reconnect.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="mt-4 gap-2 sm:gap-0">
                                            <Button variant="ghost" onClick={() => setIsDisconnectOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                onClick={handleDisconnect}
                                            >
                                                Yes, Disconnect
                                            </Button>
                                        </DialogFooter>
                                   </DialogContent>
                               </Dialog>
                           </div>
                      </div>

                      <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white flex flex-col justify-between shadow-xl">
                          <div>
                              <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                                  <Shield className="text-white" size={24} />
                              </div>
                              <h4 className="text-lg font-bold">Secure Connection</h4>
                              <p className="text-indigo-100 text-sm mt-2 leading-relaxed">
                                  Your session is securely encrypted end-to-end. Do not share your QR code with anyone.
                              </p>
                          </div>
                      </div>
                  </div>
              ) : (
                
                  <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                          <QrCode size={40} className="text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">Session Disconnected</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-8">
                          Start a new session to reactivate your WhatsApp Gateway and resume automated messaging.
                      </p>
                      <Button onClick={handleConnect} className="px-8 py-3 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                          <QrCode size={20} className="mr-2" /> 
                          Start New Session
                      </Button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
