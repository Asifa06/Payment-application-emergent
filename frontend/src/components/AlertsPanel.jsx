import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  AlertTriangle, 
  Shield, 
  DollarSign, 
  Activity, 
  XCircle,
  TrendingUp,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

const AlertsPanel = ({ transactions }) => {
  const [dynamicAlerts, setDynamicAlerts] = useState([]);
  const [showResolved, setShowResolved] = useState(false);
  const [resolvedAlerts, setResolvedAlerts] = useState(new Set());

  // Static alerts for demo
  const staticAlerts = [
    {
      id: "STATIC_001",
      type: "aml",
      title: "AML Compliance Review",
      description: "High-value transaction pattern detected requiring manual review",
      severity: "high",
      timestamp: new Date().toISOString(),
    }
  ];

  useEffect(() => {
    // Generate dynamic alerts based on transaction patterns
    const newAlerts = generateDynamicAlerts(transactions);
    setDynamicAlerts(newAlerts);
  }, [transactions]);

  const generateDynamicAlerts = (transactions) => {
    if (!transactions || transactions.length === 0) return [];
    
    const alerts = [];
    const now = new Date();
    
    // 1. High failure rate alert
    const recentTransactions = transactions.filter(txn => 
      (now - new Date(txn.date)) < 3600000 // Last hour
    );
    
    const failedCount = recentTransactions.filter(txn => txn.status === 'Failed').length;
    const failureRate = recentTransactions.length > 0 ? failedCount / recentTransactions.length : 0;
    
    if (failureRate > 0.3 && recentTransactions.length >= 3) {
      alerts.push({
        id: `DYN_${Date.now()}_FAILURE_RATE`,
        type: 'failure_pattern',
        title: 'High Failure Rate Detected',
        description: `${(failureRate * 100).toFixed(1)}% of transactions failed in the last hour (${failedCount}/${recentTransactions.length})`,
        severity: 'high',
        timestamp: now.toISOString(),
        metrics: {
          failureRate: failureRate,
          failedCount: failedCount,
          totalCount: recentTransactions.length
        }
      });
    }

    // 2. Suspicious amount patterns
    const amounts = transactions.map(txn => txn.amount).filter(amt => amt);
    const justBelowThreshold = amounts.filter(amt => amt >= 90000 && amt < 100000).length;
    
    if (justBelowThreshold >= 3) {
      alerts.push({
        id: `DYN_${Date.now()}_AMOUNT_PATTERN`,
        type: 'suspicious_pattern',
        title: 'Suspicious Amount Pattern',
        description: `Multiple transactions just below AML threshold detected (${justBelowThreshold} transactions between ₹90K-₹1L)`,
        severity: 'medium',
        timestamp: now.toISOString(),
        metrics: {
          count: justBelowThreshold,
          threshold: 100000
        }
      });
    }

    // 3. High-value transaction surge
    const highValueCount = transactions.filter(txn => txn.amount && txn.amount >= 500000).length;
    const totalTransactions = transactions.length;
    
    if (highValueCount / totalTransactions > 0.4 && totalTransactions >= 5) {
      alerts.push({
        id: `DYN_${Date.now()}_HIGH_VALUE_SURGE`,
        type: 'high_value_surge',
        title: 'High-Value Transaction Surge',
        description: `${((highValueCount / totalTransactions) * 100).toFixed(1)}% of transactions are high-value (≥₹5L). Normal range: 10-20%`,
        severity: 'medium',
        timestamp: now.toISOString(),
        metrics: {
          highValueCount: highValueCount,
          totalCount: totalTransactions,
          percentage: (highValueCount / totalTransactions) * 100
        }
      });
    }

    // 4. Channel-specific issues
    const channelStats = {};
    transactions.forEach(txn => {
      if (!channelStats[txn.channel]) {
        channelStats[txn.channel] = { total: 0, failed: 0 };
      }
      channelStats[txn.channel].total++;
      if (txn.status === 'Failed') {
        channelStats[txn.channel].failed++;
      }
    });

    Object.entries(channelStats).forEach(([channel, stats]) => {
      const failureRate = stats.failed / stats.total;
      if (failureRate > 0.5 && stats.total >= 3) {
        alerts.push({
          id: `DYN_${Date.now()}_CHANNEL_${channel}`,
          type: 'channel_degradation',
          title: `${channel} Channel Degradation`,
          description: `${channel} showing ${(failureRate * 100).toFixed(1)}% failure rate (${stats.failed}/${stats.total} transactions)`,
          severity: 'high',
          timestamp: now.toISOString(),
          metrics: {
            channel: channel,
            failureRate: failureRate,
            failedCount: stats.failed,
            totalCount: stats.total
          }
        });
      }
    });

    // 5. AML flag concentration
    const amlFlagged = transactions.filter(txn => txn.aml_flag).length;
    if (amlFlagged >= 3) {
      alerts.push({
        id: `DYN_${Date.now()}_AML_CONCENTRATION`,
        type: 'aml_pattern',
        title: 'AML Flag Concentration',
        description: `${amlFlagged} transactions flagged for AML review. Enhanced monitoring recommended.`,
        severity: 'medium',
        timestamp: now.toISOString(),
        metrics: {
          amlCount: amlFlagged,
          totalCount: totalTransactions
        }
      });
    }

    return alerts;
  };

  const getAllAlerts = () => {
    const combined = [...staticAlerts, ...dynamicAlerts];
    
    if (showResolved) {
      return combined;
    }
    
    return combined.filter(alert => !resolvedAlerts.has(alert.id));
  };

  const getAlertIcon = (type) => {
    const iconMap = {
      'failure': XCircle,
      'failure_pattern': TrendingUp,
      'high_value': DollarSign,
      'high_value_surge': DollarSign,
      'aml': Shield,
      'aml_pattern': Shield,
      'cross_border': Activity,
      'suspicious_pattern': AlertTriangle,
      'channel_degradation': Activity
    };
    
    const IconComponent = iconMap[type] || AlertTriangle;
    return <IconComponent className="h-4 w-4" />;
  };

  const getAlertColor = (severity, type) => {
    if (severity === 'high') return 'text-red-600';
    if (type === 'aml' || type === 'aml_pattern') return 'text-purple-600';
    if (type === 'high_value' || type === 'high_value_surge') return 'text-amber-600';
    if (type === 'channel_degradation') return 'text-blue-600';
    return 'text-amber-600';
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      'high': 'bg-red-50 text-red-700 border-red-200',
      'medium': 'bg-amber-50 text-amber-700 border-amber-200',
      'low': 'bg-blue-50 text-blue-700 border-blue-200'
    };
    
    return (
      <Badge className={`text-xs ${colors[severity] || colors.medium}`}>
        {severity?.toUpperCase() || 'MEDIUM'}
      </Badge>
    );
  };

  const resolveAlert = (alertId) => {
    setResolvedAlerts(prev => new Set([...prev, alertId]));
  };

  const unresolveAlert = (alertId) => {
    setResolvedAlerts(prev => {
      const newSet = new Set(prev);
      newSet.delete(alertId);
      return newSet;
    });
  };

  const allAlerts = getAllAlerts();
  const unresolvedCount = allAlerts.filter(alert => !resolvedAlerts.has(alert.id)).length;

  return (
    <Card className="bg-white border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h3 className="font-semibold text-gray-900">System Alerts</h3>
          <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
            {unresolvedCount} Active
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowResolved(!showResolved)}
          className="text-gray-600 hover:text-gray-900"
        >
          {showResolved ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="ml-2 text-xs">
            {showResolved ? 'Hide Resolved' : 'Show All'}
          </span>
        </Button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {allAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No alerts at this time</p>
            <p className="text-xs opacity-75">System monitoring is active</p>
          </div>
        ) : (
          allAlerts
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map((alert) => {
              const isResolved = resolvedAlerts.has(alert.id);
              return (
                <div 
                  key={alert.id} 
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    isResolved 
                      ? 'border-gray-200 opacity-60 bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={getAlertColor(alert.severity, alert.type)}>
                        {getAlertIcon(alert.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium text-sm ${isResolved ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {alert.title}
                          </h4>
                          {getSeverityBadge(alert.severity)}
                        </div>
                        
                        <p className={`text-xs ${isResolved ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                          {alert.description}
                        </p>
                        
                        {alert.metrics && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {Object.entries(alert.metrics).map(([key, value]) => (
                              <span 
                                key={key} 
                                className={`text-xs px-2 py-1 rounded ${
                                  isResolved ? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {key}: {typeof value === 'number' && value < 1 && value > 0 ? 
                                  `${(value * 100).toFixed(1)}%` : 
                                  typeof value === 'number' ? value.toLocaleString() : value
                                }
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <p className={`text-xs ${isResolved ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-xs h-6 px-2 ${
                              isResolved 
                                ? 'text-emerald-600 hover:text-emerald-700' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                            onClick={() => isResolved ? unresolveAlert(alert.id) : resolveAlert(alert.id)}
                          >
                            {isResolved ? 'Unresolve' : 'Resolve'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {dynamicAlerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-blue-600 mb-1">🤖 AI-Generated Insights</p>
          <p className="text-xs text-gray-500">
            {dynamicAlerts.length} pattern-based alert{dynamicAlerts.length !== 1 ? 's' : ''} detected from transaction analysis
          </p>
        </div>
      )}
    </Card>
  );
};

export default AlertsPanel;