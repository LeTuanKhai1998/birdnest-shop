'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/lib/api';

export default function TestAuthPage() {
  const [email, setEmail] = useState('admin@birdnest.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState('');
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    // Check current auth status
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('user');
    setAuthStatus(`Token: ${token ? 'Present' : 'Missing'}, User: ${user ? 'Present' : 'Missing'}`);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await apiService.login(email, password);
      localStorage.setItem('auth-token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setAuthStatus(`Logged in as: ${response.user.name} (${response.user.isAdmin ? 'Admin' : 'User'})`);
      setTestResult('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      setTestResult(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestDelete = async () => {
    setLoading(true);
    try {
      // Get a product to delete
      const products = await apiService.getProducts();
      if (products.length === 0) {
        setTestResult('No products available to delete');
        return;
      }
      
      const productToDelete = products[0];
      setTestResult(`Attempting to delete product: ${productToDelete.name} (${productToDelete.id})`);
      
      await apiService.deleteProduct(productToDelete.id);
      setTestResult(`Successfully deleted product: ${productToDelete.name}`);
    } catch (error) {
      console.error('Delete test error:', error);
      setTestResult(`Delete test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    setAuthStatus('Logged out');
    setTestResult('');
  };

  const handleCheckAuth = () => {
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('user');
    setAuthStatus(`Token: ${token ? 'Present' : 'Missing'}, User: ${user ? 'Present' : 'Missing'}`);
    if (token) {
      setTestResult(`Token: ${token.substring(0, 50)}...`);
    } else {
      setTestResult('No token found');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@birdnest.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
            />
          </div>
          
          <div className="space-y-2">
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Button onClick={handleTestDelete} disabled={loading} variant="outline" className="w-full">
              Test Delete Product
            </Button>
            <Button onClick={handleCheckAuth} variant="outline" className="w-full">
              Check Auth Status
            </Button>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              Logout
            </Button>
          </div>

          <div className="mt-4 p-3 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Auth Status:</h3>
            <p className="text-sm">{authStatus}</p>
          </div>

          {testResult && (
            <div className="mt-4 p-3 bg-blue-100 rounded">
              <h3 className="font-medium mb-2">Test Result:</h3>
              <p className="text-sm">{testResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 