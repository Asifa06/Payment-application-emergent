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
  RefreshCw,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockAIResponses, scenarioSimulations } from '../mock';
import TransactionForm from './TransactionForm';
import AlertsPanel from './AlertsPanel';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout, API } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'ai', message: 'Hello! I\'m your Payment AI assistant. Ask me about payment transactions, compliance rules, or system processes. I can also explain transaction failures and processing flows.' }
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

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, []);

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
    
    setFilteredTransactions(filtered);
  }, [filters, transactions]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/transactions`);
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionCreate = async (newTransaction) => {
    // Refresh transactions from server
    await loadTransactions();
    
    // Add AI message about the transaction
    const aiMessage = {
      id: chatMessages.length + 1,
      type: 'ai',
      message: `✅ **New Transaction Created**\n\n**Transaction ID:** ${newTransaction.id}\n**Status:** ${newTransaction.status}\n**Channel:** ${newTransaction.channel}\n**Amount:** ₹${newTransaction.amount?.toLocaleString()}\n\n${newTransaction.status === 'Failed' ? `**Failure Reason:** ${newTransaction.failure_reason}` : 'Transaction is being processed...'}`,
      suggestions: newTransaction.status === 'Failed' ? ["Review failure reason", "Retry with corrections", "Contact support"] : ["Monitor transaction status", "View transaction details"],
      transactionId: newTransaction.id
    };
    
    setChatMessages(prev => [...prev, aiMessage]);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-600" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'success': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'failed': return 'bg-red-50 text-red-700 border-red-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">PayInsight</h1>
              <p className="text-gray-600 mt-1">Smart Payment Intelligence Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.name}</span>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  {user?.role}
                </Badge>
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTransactions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="bg-white border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Successful</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.successCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </Card>

          <Card className="bg-white border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Failed</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.failedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="bg-white border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-gray-100 border border-gray-200 mb-6 p-1 rounded-lg">
                <TabsTrigger 
                  value="transactions" 
                  className="text-gray-700 font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 rounded-md transition-all duration-200"
                >
                  Recent Transactions
                </TabsTrigger>
                <TabsTrigger 
                  value="create" 
                  className="text-gray-700 font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 rounded-md transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Transaction
                </TabsTrigger>
                <TabsTrigger 
                  value="alerts" 
                  className="text-gray-700 font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 rounded-md transition-all duration-200"
                >
                  System Alerts
                </TabsTrigger>
                <TabsTrigger 
                  value="simulator" 
                  className="text-gray-700 font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 rounded-md transition-all duration-200"
                >
                  Scenario Simulator
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions">
                {/* Filters */}
                <Card className="bg-white border-gray-200 p-6 mb-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Filters</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({ status: 'all', channel: 'all', amountMin: '', amountMax: '' })}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Status</label>
                      <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}>
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Channel</label>
                      <Select value={filters.channel} onValueChange={(value) => setFilters(prev => ({...prev, channel: value}))}>
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="all">All Channels</SelectItem>
                          <SelectItem value="IMPS">IMPS</SelectItem>
                          <SelectItem value="NEFT">NEFT</SelectItem>
                          <SelectItem value="RTGS">RTGS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Min Amount</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.amountMin}
                        onChange={(e) => setFilters(prev => ({...prev, amountMin: e.target.value}))}
                        className="bg-white border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Max Amount</label>
                      <Input
                        type="number"
                        placeholder="∞"
                        value={filters.amountMax}
                        onChange={(e) => setFilters(prev => ({...prev, amountMax: e.target.value}))}
                        className="bg-white border-gray-300"
                      />
                    </div>
                  </div>
                </Card>

                {/* Transactions Table */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-4 text-gray-600 font-medium">Transaction ID</th>
                          <th className="text-left p-4 text-gray-600 font-medium">Sender</th>
                          <th className="text-left p-4 text-gray-600 font-medium">Receiver</th>
                          <th className="text-left p-4 text-gray-600 font-medium">Amount</th>
                          <th className="text-left p-4 text-gray-600 font-medium">Channel</th>
                          <th className="text-left p-4 text-gray-600 font-medium">Status</th>
                          <th className="text-left p-4 text-gray-600 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((txn) => (
                          <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-4">
                              <div className="font-mono text-sm text-blue-600">{txn.id}</div>
                            </td>
                            <td className="p-4 text-gray-900">{txn.sender}</td>
                            <td className="p-4 text-gray-900">{txn.receiver}</td>
                            <td className="p-4">
                              <span className="font-semibold text-gray-900">₹{txn.amount?.toLocaleString()}</span>
                              {txn.high_value && <Badge className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-xs">High Value</Badge>}
                              {txn.aml_flag && <Badge className="ml-2 bg-purple-50 text-purple-700 border-purple-200 text-xs">AML</Badge>}
                            </td>
                            <td className="p-4">
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200">{txn.channel}</Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(txn.status)}
                                <Badge className={getStatusColor(txn.status)}>
                                  {txn.status}
                                </Badge>
                              </div>
                              {txn.failure_reason && (
                                <div className="text-xs text-red-600 mt-1">{txn.failure_reason}</div>
                              )}
                            </td>
                            <td className="p-4 text-gray-600 text-sm">
                              {new Date(txn.date).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredTransactions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No transactions match the current filters</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="create">
                <TransactionForm onTransactionCreate={handleTransactionCreate} />
              </TabsContent>

              <TabsContent value="alerts">
                <AlertsPanel transactions={transactions} />
              </TabsContent>

              <TabsContent value="simulator">
                <Card className="bg-white border-gray-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Payment Scenario Simulator</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Payment Method</label>
                      <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="imps">IMPS - Immediate Payment</SelectItem>
                          <SelectItem value="neft">NEFT - Batch Processing</SelectItem>
                          <SelectItem value="rtgs">RTGS - Real Time Gross</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">Scenario Type</label>
                      <Select value={scenarioType} onValueChange={setScenarioType}>
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="success">Success Flow</SelectItem>
                          <SelectItem value="failure">Failure Flow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={runScenario} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Run Simulation
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - AI Chat */}
          <div className="space-y-8">
            <Card className="bg-white border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Payment AI Assistant</h3>
                <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs">
                  Live
                </Badge>
              </div>
              
              <div className="h-80 overflow-y-auto mb-4 space-y-3 border border-gray-200 rounded-lg p-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : msg.type === 'scenario'
                        ? 'bg-purple-50 text-purple-900 border border-purple-200'
                        : 'bg-gray-50 text-gray-900 border border-gray-200'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm">{msg.message}</div>
                      {msg.suggestions && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-600">Suggestions:</p>
                          {msg.suggestions.map((suggestion, index) => (
                            <div key={index} className="text-xs bg-white rounded px-2 py-1 border border-gray-200">
                              • {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.transactionId && (
                        <div className="mt-2 text-xs text-blue-600 font-mono">
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
                  className="bg-white border-gray-300"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                💡 Try asking: "Why did transaction fail?" or "Explain NEFT processing flow"
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;