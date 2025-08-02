import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  MessageSquare,
  Send,
  Filter,
  Activity,
  Shield,
  DollarSign,
  Plus,
  RefreshCw
} from 'lucide-react';
import { mockTransactions, mockAlerts, mockAIResponses, scenarioSimulations } from '../mock';
import TransactionForm from './TransactionForm';
import AlertsPanel from './AlertsPanel';

const Dashboard = () => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactions);
  const [alerts] = useState(mockAlerts);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'ai', message: 'Hello! I\'m your GPP AI assistant. Ask me about payment transactions, compliance rules, or system processes. I can also explain transaction failures and processing flows.' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    channel: 'all',
    amountMin: '',
    amountMax: ''
  });
  const [selectedScenario, setSelectedScenario] = useState('imps');
  const [scenarioType, setScenarioType] = useState('success');
  const [activeTab, setActiveTab] = useState('transactions');

  // Filter transactions based on current filters
  useEffect(() => {
    let filtered = transactions;
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(txn => txn.status.toLowerCase() === filters.status);
    }
    
    if (filters.channel !== 'all') {
      filtered = filtered.filter(txn => txn.channel === filters.channel);
    }
    
    if (filters.amountMin) {
      filtered = filtered.filter(txn => txn.amount >= parseInt(filters.amountMin));
    }
    
    if (filters.amountMax) {
      filtered = filtered.filter(txn => txn.amount <= parseInt(filters.amountMax));
    }
    
    setFilteredTransactions(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, [filters, transactions]);

  const handleTransactionCreate = (newTransaction) => {
    if (newTransaction.updateOnly) {
      // Update existing transaction status
      setTransactions(prev => prev.map(txn => 
        txn.id === newTransaction.id 
          ? { ...txn, status: newTransaction.status }
          : txn
      ));
    } else {
      // Add new transaction
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };

  const handleAIMessage = (type, reason, txnData) => {
    let response;
    
    switch (type) {
      case 'transaction_created':
        response = mockAIResponses.transaction_created(txnData);
        break;
      case 'transaction_failed':
        response = mockAIResponses.transaction_failed(reason, txnData);
        break;
      case 'transaction_success':
        response = {
          response: `✅ **Transaction Completed Successfully**\n\nTransaction ${txnData.id} has been processed and settled successfully. Funds have been credited to the beneficiary account.`,
          suggestions: ["View transaction details", "Download receipt", "Track similar transactions"]
        };
        break;
      default:
        return;
    }

    const newAIMessage = {
      id: chatMessages.length + 1,
      type: 'ai',
      message: response.response,
      suggestions: response.suggestions,
      transactionId: txnData.id
    };

    setChatMessages(prev => [...prev, newAIMessage]);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'success': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const newUserMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message: currentMessage
    };

    setChatMessages(prev => [...prev, newUserMessage]);

    // Simulate AI response
    setTimeout(() => {
      const query = currentMessage.toLowerCase();
      let response = mockAIResponses["why did this transaction fail"]; // default
      
      if (query.includes('fail')) {
        response = mockAIResponses["why did this transaction fail"];
      } else if (query.includes('neft') && query.includes('delay')) {
        response = mockAIResponses["common reasons for neft delays"];
      } else if (query.includes('rtgs') && query.includes('flow')) {
        response = mockAIResponses["rtgs transaction flow in gpp"];
      } else if (query.includes('fraud')) {
        response = mockAIResponses["fraud detection patterns"];
      } else if (query.includes('aml') || query.includes('compliance')) {
        response = mockAIResponses["aml compliance rules"];
      }

      const newAIMessage = {
        id: chatMessages.length + 2,
        type: 'ai',
        message: response.response,
        suggestions: response.suggestions
      };

      setChatMessages(prev => [...prev, newAIMessage]);
    }, 1000);

    setCurrentMessage('');
  };

  const runScenario = () => {
    const scenario = scenarioSimulations[selectedScenario][scenarioType];
    
    const scenarioMessage = {
      id: chatMessages.length + 1,
      type: 'scenario',
      message: `**${selectedScenario.toUpperCase()} ${scenarioType.toUpperCase()} Simulation**\n\n**Process Flow:**\n${scenario.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\n**Timeline:** ${scenario.timeline}\n\n**Explanation:** ${scenario.explanation}`
    };

    setChatMessages(prev => [...prev, scenarioMessage]);
  };

  const stats = {
    totalTransactions: transactions.length,
    successCount: transactions.filter(t => t.status === 'Success').length,
    failedCount: transactions.filter(t => t.status === 'Failed').length,
    pendingCount: transactions.filter(t => t.status === 'Pending').length
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-teal-400">PayInsight</h1>
          <p className="text-gray-400 mt-1">Smart Payment Intelligence Dashboard - Enterprise Simulation Platform</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Transactions</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalTransactions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-teal-400" />
            </div>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Successful</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.successCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Failed</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{stats.failedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-gray-900 border-gray-800 mb-6">
                <TabsTrigger value="transactions" className="data-[state=active]:bg-teal-600">
                  Recent Transactions
                </TabsTrigger>
                <TabsTrigger value="create" className="data-[state=active]:bg-teal-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Transaction
                </TabsTrigger>
                <TabsTrigger value="alerts" className="data-[state=active]:bg-teal-600">
                  System Alerts
                </TabsTrigger>
                <TabsTrigger value="simulator" className="data-[state=active]:bg-teal-600">
                  Scenario Simulator
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions">
                {/* Filters */}
                <Card className="bg-gray-900 border-gray-800 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-teal-400" />
                      <h3 className="font-semibold text-white">Filters</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({ status: 'all', channel: 'all', amountMin: '', amountMax: '' })}
                      className="text-gray-400 hover:text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Status</label>
                      <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Channel</label>
                      <Select value={filters.channel} onValueChange={(value) => setFilters(prev => ({...prev, channel: value}))}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="all">All Channels</SelectItem>
                          <SelectItem value="IMPS">IMPS</SelectItem>
                          <SelectItem value="NEFT">NEFT</SelectItem>
                          <SelectItem value="RTGS">RTGS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Min Amount</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.amountMin}
                        onChange={(e) => setFilters(prev => ({...prev, amountMin: e.target.value}))}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Max Amount</label>
                      <Input
                        type="number"
                        placeholder="∞"
                        value={filters.amountMax}
                        onChange={(e) => setFilters(prev => ({...prev, amountMax: e.target.value}))}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>
                </Card>

                {/* Transactions Table */}
                <Card className="bg-gray-900 border-gray-800">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left p-4 text-gray-400 font-medium">Transaction ID</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Sender</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Receiver</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Channel</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((txn) => (
                          <tr key={txn.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="p-4">
                              <div className="font-mono text-sm text-teal-400">{txn.id}</div>
                            </td>
                            <td className="p-4 text-white">{txn.sender}</td>
                            <td className="p-4 text-white">{txn.receiver}</td>
                            <td className="p-4">
                              <span className="font-semibold text-white">₹{txn.amount.toLocaleString()}</span>
                              {txn.highValue && <Badge className="ml-2 bg-amber-500/10 text-amber-400 text-xs">High Value</Badge>}
                              {txn.amlFlag && <Badge className="ml-2 bg-purple-500/10 text-purple-400 text-xs">AML</Badge>}
                            </td>
                            <td className="p-4">
                              <Badge className="bg-gray-800 text-gray-300">{txn.channel}</Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(txn.status)}
                                <Badge className={getStatusColor(txn.status)}>
                                  {txn.status}
                                </Badge>
                              </div>
                              {txn.failureReason && (
                                <div className="text-xs text-red-400 mt-1">{txn.failureReason}</div>
                              )}
                            </td>
                            <td className="p-4 text-gray-400 text-sm">
                              {new Date(txn.date).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredTransactions.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No transactions match the current filters</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="create">
                <TransactionForm 
                  onTransactionCreate={handleTransactionCreate}
                  onAIMessage={handleAIMessage}
                />
              </TabsContent>

              <TabsContent value="alerts">
                <AlertsPanel 
                  transactions={transactions} 
                  alerts={alerts}
                />
              </TabsContent>

              <TabsContent value="simulator">
                <Card className="bg-gray-900 border-gray-800 p-6">
                  <h3 className="font-semibold text-white mb-4">Payment Scenario Simulator</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Payment Method</label>
                      <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="imps">IMPS - Immediate Payment</SelectItem>
                          <SelectItem value="neft">NEFT - Batch Processing</SelectItem>
                          <SelectItem value="rtgs">RTGS - Real Time Gross</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Scenario Type</label>
                      <Select value={scenarioType} onValueChange={setScenarioType}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="success">Success Flow</SelectItem>
                          <SelectItem value="failure">Failure Flow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={runScenario} 
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Run Simulation
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - AI Chat */}
          <div className="space-y-8">
            <Card className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-teal-400" />
                <h3 className="font-semibold text-white">GPP AI Assistant</h3>
                <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-xs">
                  Live
                </Badge>
              </div>
              
              <div className="h-80 overflow-y-auto mb-4 space-y-3 border border-gray-800 rounded-lg p-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      msg.type === 'user' 
                        ? 'bg-teal-600 text-white' 
                        : msg.type === 'scenario'
                        ? 'bg-purple-600/20 text-purple-100 border border-purple-500/30'
                        : 'bg-gray-800 text-gray-100'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm">{msg.message}</div>
                      {msg.suggestions && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-400">Suggestions:</p>
                          {msg.suggestions.map((suggestion, index) => (
                            <div key={index} className="text-xs bg-gray-700 rounded px-2 py-1">
                              • {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.transactionId && (
                        <div className="mt-2 text-xs text-teal-300 font-mono">
                          Ref: {msg.transactionId}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ask about payments, compliance, failures, or processing flows..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-gray-800 border-gray-700"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-teal-600 hover:bg-teal-700 px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3 text-xs text-gray-400">
                💡 Try asking: "Why did transaction TXN123 fail?" or "Explain NEFT processing flow"
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;