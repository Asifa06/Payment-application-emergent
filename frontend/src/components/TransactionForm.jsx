import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { validateIFSC, generateTransactionId, blockedAccounts } from '../mock';

const TransactionForm = ({ onTransactionCreate, onAIMessage }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sender || !formData.receiver || !formData.amount || !formData.channel || !formData.ifsc) {
      alert('Please fill all required fields');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Validating transaction...');

    const amount = parseFloat(formData.amount);
    const transactionId = generateTransactionId();
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Validation logic
    let status = 'Pending';
    let failureReason = null;
    let amlFlag = false;
    let highValue = amount >= 200000;

    // 1. IFSC validation
    if (!validateIFSC(formData.ifsc)) {
      status = 'Failed';
      failureReason = 'Invalid IFSC code';
    }
    // 2. Blocked account check
    else if (blockedAccounts.includes(formData.sender.toUpperCase()) || 
             blockedAccounts.includes(formData.receiver.toUpperCase())) {
      status = 'Failed';
      failureReason = 'Account blocked';
    }
    // 3. AML check for high amounts
    else if (amount >= 100000) {
      amlFlag = true;
      if (amount >= 1000000) {
        status = 'Failed';
        failureReason = 'AML compliance hold';
      }
    }
    // 4. Channel-specific limits
    else if (formData.channel === 'IMPS' && amount > 500000) {
      status = 'Failed';
      failureReason = 'Transaction limit exceeded';
    }
    else if (formData.channel === 'RTGS' && amount < 200000) {
      status = 'Failed';
      failureReason = 'Amount below RTGS minimum limit';
    }
    // 5. Random failure simulation (10% chance)
    else if (Math.random() < 0.1) {
      status = 'Failed';
      failureReason = 'Insufficient funds';
    }

    const newTransaction = {
      id: transactionId,
      sender: formData.sender,
      receiver: formData.receiver,
      amount: amount,
      channel: formData.channel,
      status: status,
      date: new Date().toISOString(),
      ifsc: formData.ifsc,
      failureReason: failureReason,
      amlFlag: amlFlag,
      highValue: highValue,
      purpose: formData.purpose
    };

    setProcessingStatus(`Transaction ${status.toLowerCase()}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add transaction to list
    onTransactionCreate(newTransaction);

    // Send AI message about transaction
    if (status === 'Failed') {
      onAIMessage('transaction_failed', failureReason, newTransaction);
    } else {
      onAIMessage('transaction_created', null, newTransaction);
    }

    // If successful, simulate status updates
    if (status !== 'Failed') {
      simulateStatusUpdates(transactionId);
    }

    setIsProcessing(false);
    setProcessingStatus('');
    
    // Reset form
    setFormData({
      sender: '',
      receiver: '',
      amount: '',
      channel: '',
      ifsc: '',
      purpose: ''
    });
  };

  const simulateStatusUpdates = (transactionId) => {
    // Simulate real-time status updates
    const updateStatus = (newStatus) => {
      onTransactionCreate({
        id: transactionId,
        status: newStatus,
        updateOnly: true
      });
    };

    // Random success/failure after processing
    setTimeout(() => {
      const isSuccessful = Math.random() > 0.2; // 80% success rate
      if (isSuccessful) {
        updateStatus('Success');
        onAIMessage('transaction_success', null, { id: transactionId });
      } else {
        updateStatus('Failed');
        onAIMessage('transaction_failed', 'Network timeout', { id: transactionId });
      }
    }, Math.random() * 10000 + 5000); // 5-15 seconds
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    <Card className="bg-gray-900 border-gray-800 p-6">
      <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-teal-400" />
        Create New Payment Transaction
      </h3>

      {isProcessing && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400 animate-spin" />
            <span className="text-blue-400 text-sm">{processingStatus}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300 mb-2 block">Sender Account *</Label>
            <Input
              value={formData.sender}
              onChange={(e) => handleInputChange('sender', e.target.value)}
              placeholder="Enter sender name/account"
              className="bg-gray-800 border-gray-700"
              disabled={isProcessing}
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Receiver Account *</Label>
            <Input
              value={formData.receiver}
              onChange={(e) => handleInputChange('receiver', e.target.value)}
              placeholder="Enter receiver name/account"
              className="bg-gray-800 border-gray-700"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300 mb-2 block">Amount (₹) *</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Enter amount"
              className="bg-gray-800 border-gray-700"
              min="1"
              disabled={isProcessing}
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">IFSC Code *</Label>
            <Input
              value={formData.ifsc}
              onChange={(e) => handleInputChange('ifsc', e.target.value.toUpperCase())}
              placeholder="e.g., HDFC0000123"
              className="bg-gray-800 border-gray-700"
              maxLength="11"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div>
          <Label className="text-gray-300 mb-2 block">Payment Channel *</Label>
          <Select 
            value={formData.channel} 
            onValueChange={(value) => handleInputChange('channel', value)}
            disabled={isProcessing}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select payment channel" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="IMPS">IMPS - Immediate Payment</SelectItem>
              <SelectItem value="NEFT">NEFT - Electronic Funds Transfer</SelectItem>
              <SelectItem value="RTGS">RTGS - Real Time Gross Settlement</SelectItem>
            </SelectContent>
          </Select>
          {formData.channel && (
            <p className="text-xs text-gray-400 mt-1">
              {getChannelInfo(formData.channel)}
            </p>
          )}
        </div>

        <div>
          <Label className="text-gray-300 mb-2 block">Purpose (Optional)</Label>
          <Input
            value={formData.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            placeholder="Payment purpose/description"
            className="bg-gray-800 border-gray-700"
            disabled={isProcessing}
          />
        </div>

        <div className="pt-4 border-t border-gray-800">
          <Button 
            type="submit" 
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
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

        <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-400">
              <p className="font-medium text-amber-400 mb-1">Validation Rules:</p>
              <ul className="space-y-1">
                <li>• IFSC must be valid 11-character format</li>
                <li>• Amounts ≥₹1L trigger AML checks</li>
                <li>• RTGS minimum: ₹2L, IMPS maximum: ₹5L</li>
                <li>• Blocked accounts will be rejected</li>
                <li>• Random network failures may occur (~10%)</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default TransactionForm;