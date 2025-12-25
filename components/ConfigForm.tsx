
import React, { useState } from 'react';
import { Settings, Save, AlertTriangle } from 'lucide-react';
import { saveConfig } from '../services/firebase';

export const ConfigForm: React.FC = () => {
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseConfig.apiKey) {
        alert("Firebase API Key is required");
        return;
    }
    saveConfig({
      firebase: firebaseConfig
    });
  };

  const handleFirebaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirebaseConfig(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-lg bg-dark-surface border border-dark-border rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-brand-500/10 rounded-xl">
            <Settings className="w-8 h-8 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">App Configuration</h1>
            <p className="text-zinc-400 text-sm">Connect your backend services</p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-200">
            Environment variables are missing. Please enter your Firebase credentials manually. 
            These will be saved locally in your browser.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Firebase Configuration</h2>
            <div className="grid grid-cols-1 gap-3">
               <input
                 name="apiKey"
                 placeholder="API Key"
                 value={firebaseConfig.apiKey}
                 onChange={handleFirebaseChange}
                 className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
                 required
               />
               <input
                 name="authDomain"
                 placeholder="Auth Domain"
                 value={firebaseConfig.authDomain}
                 onChange={handleFirebaseChange}
                 className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
               />
               <input
                 name="projectId"
                 placeholder="Project ID"
                 value={firebaseConfig.projectId}
                 onChange={handleFirebaseChange}
                 className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
               />
               <input
                  name="storageBucket"
                  placeholder="Storage Bucket"
                  value={firebaseConfig.storageBucket}
                  onChange={handleFirebaseChange}
                  className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
                />
                <input
                  name="messagingSenderId"
                  placeholder="Messaging Sender ID"
                  value={firebaseConfig.messagingSenderId}
                  onChange={handleFirebaseChange}
                  className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
                />
                <input
                  name="appId"
                  placeholder="App ID"
                  value={firebaseConfig.appId}
                  onChange={handleFirebaseChange}
                  className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white text-sm focus:border-brand-500 focus:outline-none"
                />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </form>
      </div>
    </div>
  );
};
