import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const TransactionForm = ({ onTransactionCreate }) => {
  const { API } = useAuth();
  const [formData, setFormData] = useState({
    sender: '',
    receiver: '',
    amount: '',
    channel: '',
    ifsc: '',
    purpose: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.sender || !formData.receiver || !formData.amount || !formData.channel || !formData.ifsc) {
      setError('Please fill all required fields');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Creating transaction...');

    try {
      const response = await axios.post(`${API}/transactions`, {
        sender: formData.sender,
        receiver: formData.receiver,
        amount: parseFloat(formData.amount),
        channel: formData.channel,
        ifsc: formData.ifsc.toUpperCase(),
        purpose: formData.purpose || null
      });

      if (response.data.success) {
        setProcessingStatus('Transaction created successfully!');
        
        // Call the callback to refresh the transactions list
        if (onTransactionCreate) {
          onTransactionCreate(response.data.transaction);
        }

        // Reset form after successful creation
        setTimeout(() => {
          setFormData({
            sender: '',
            receiver: '',
            amount: '',
            channel: '',
            ifsc: '',
            purpose: ''
          });
          setProcessingStatus('');
        }, 2000);

      } else {
        setError(response.data.message || 'Failed to create transaction');
        setProcessingStatus('');
      }

    } catch (error) {
      console.error('Transaction creation error:', error);
      setError(error.response?.data?.detail || 'Failed to create transaction');
      setProcessingStatus('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const getChannelInfo = (channel) => {
    const info = {
      IMPS: 'Immediate Payment Service - Instant transfer up to ₹5L',
      NEFT: 'National Electronic Funds Transfer - Batch processing',
      RTGS: 'Real Time Gross Settlement - Min ₹2L, real-time'
    };
    return info[channel] || '';
  };

  return (
    <Card className="bg-white border-gray-200 p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-blue-600" />
        Create New Payment Transaction
      </h3>

      {isProcessing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-blue-700 text-sm">{processingStatus}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-700 mb-2 block">Sender Account *</Label>
            <Input
              value={formData.sender}
              onChange={(e) => handleInputChange('sender', e.target.value)}
              placeholder="Enter sender name/account"
              className="bg-white border-gray-300"
              disabled={isProcessing}
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block">Receiver Account *</Label>
            <Input
              value={formData.receiver}
              onChange={(e) => handleInputChange('receiver', e.target.value)}
              placeholder="Enter receiver name/account"
              className="bg-white border-gray-300"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-700 mb-2 block">Amount (₹) *</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Enter amount"
              className="bg-white border-gray-300"
              min="1"
              disabled={isProcessing}
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block">IFSC Code *</Label>
            <Input
              value={formData.ifsc}
              onChange={(e) => handleInputChange('ifsc', e.target.value.toUpperCase())}
              placeholder="e.g., HDFC0000123"
              className="bg-white border-gray-300"
              maxLength="11"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div>
          <Label className="text-gray-700 mb-2 block">Payment Channel *</Label>
          <Select 
            value={formData.channel} 
            onValueChange={(value) => handleInputChange('channel', value)}
            disabled={isProcessing}
          >
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="Select payment channel" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300">
              <SelectItem value="IMPS">IMPS - Immediate Payment</SelectItem>
              <SelectItem value="NEFT">NEFT - Electronic Funds Transfer</SelectItem>
              <SelectItem value="RTGS">RTGS - Real Time Gross Settlement</SelectItem>
            </SelectContent>
          </Select>
          {formData.channel && (
            <p className="text-xs text-gray-500 mt-1">
              {getChannelInfo(formData.channel)}
            </p>
          )}
        </div>

        <div>
          <Label className="text-gray-700 mb-2 block">Purpose (Optional)</Label>
          <Input
            value={formData.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            placeholder="Payment purpose/description"
            className="bg-white border-gray-300"
            disabled={isProcessing}
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" />
                Processing Transaction...
              </div>
            ) : (
              'Submit Payment Transaction'
            )}
          </Button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <p className="font-medium text-amber-700 mb-1">Validation Rules:</p>
              <ul className="space-y-1">
                <li>• IFSC must be valid 11-character format (e.g., ABCD0123456)</li>
                <li>• Amounts ≥₹1L trigger AML compliance checks</li>
                <li>• RTGS minimum: ₹2L, IMPS maximum: ₹5L</li>
                <li>• Blocked accounts will be automatically rejected</li>
                <li>• Random network failures may occur (~5% chance)</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default TransactionForm;