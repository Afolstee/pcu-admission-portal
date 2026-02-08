'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function BackendSetupGuide() {
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      setBackendConnected(response.ok);
    } catch {
      setBackendConnected(false);
    }
  };

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (backendConnected === null) {
    return <div className="text-center py-8">Checking backend connection...</div>;
  }

  if (backendConnected) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Backend Connected</AlertTitle>
        <AlertDescription className="text-green-700">
          Your backend is running at http://localhost:5000. You're all set!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Backend Not Connected</AlertTitle>
        <AlertDescription className="text-red-700">
          The backend server is not running. Follow the steps below to get started.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {/* Backend Setup Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                1
              </span>
              Start Python Backend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">Open terminal and run:</p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span>cd backend</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => copyCommand('cd backend')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>python -m venv venv</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => copyCommand('python -m venv venv')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>source venv/bin/activate</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => copyCommand('source venv/bin/activate')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Setup Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                2
              </span>
              Setup Database
            </CardTitle>
            <CardDescription>Make sure MySQL is running</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">Run in backend directory:</p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span>pip install -r requirements.txt</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => copyCommand('pip install -r requirements.txt')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Create database schema:</p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span>mysql -u root -p &lt; database_schema.sql</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() =>
                      copyCommand('mysql -u root -p < database_schema.sql')
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seed Data Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                3
              </span>
              Seed Test Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">Create admin and test users:</p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span>python seed.py</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => copyCommand('python seed.py')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Test Credentials:</p>
              <div className="space-y-2 text-sm text-blue-800 font-mono">
                <p>Admin: admin@university.edu / admin123</p>
                <p>Applicant: john.doe@example.com / password123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Backend Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                4
              </span>
              Start Backend Server
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">From backend directory:</p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span>python app.py</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => copyCommand('python app.py')}
                  >
                    <Copy className="h-4 w-6" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Backend will start at: <span className="font-mono">http://localhost:5000</span>
              </p>
              <p className="text-sm text-green-800 mt-2">
                Then refresh this page to continue!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <Button onClick={checkBackendConnection} size="lg" className="w-full">
          Check Connection
        </Button>

        {copied && (
          <div className="text-sm text-green-600 text-center">✓ Copied to clipboard!</div>
        )}
      </div>

      <div className="text-sm text-slate-600 border-t pt-4">
        <p className="font-medium mb-2">For detailed setup instructions, see:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>QUICK_START.md - Quick reference guide</li>
          <li>SETUP_GUIDE.md - Detailed setup documentation</li>
          <li>backend/README.md - Backend-specific documentation</li>
        </ul>
      </div>
    </div>
  );
}
