import { useState } from 'react';
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, Download, Users, Building2 } from "lucide-react";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import type { FeaslyModelFormData } from "./types";
import { useContractors, type Contractor } from "@/hooks/useContractors";
import { ContractorDialog } from "./ContractorDialog";

interface ContractorBreakdownProps {
  projectId: string;
}

export function ContractorBreakdown({ projectId }: ContractorBreakdownProps) {
  const form = useFormContext<FeaslyModelFormData>();
  const [selectedContractor, setSelectedContractor] = useState<Contractor | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { 
    contractors, 
    isLoading, 
    createContractor, 
    updateContractor, 
    deleteContractor,
    exportToCSV
  } = useContractors(projectId);

  const currencyCode = form.watch("currency_code") || "AED";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const handleCreateContractor = () => {
    setSelectedContractor(undefined);
    setIsDialogOpen(true);
  };

  const handleEditContractor = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setIsDialogOpen(true);
  };

  const handleSaveContractor = async (data: any) => {
    if (selectedContractor) {
      await updateContractor(selectedContractor.id!, {
        name: data.name,
        phase: data.phase,
        amount: data.amount,
        status: data.status,
        risk_rating: data.risk_rating,
        contact_person: data.contact_person,
        contact_email: data.contact_email,
        start_date: data.start_date ? format(data.start_date, 'yyyy-MM-dd') : undefined,
        expected_completion: data.expected_completion ? format(data.expected_completion, 'yyyy-MM-dd') : undefined,
        actual_completion: data.actual_completion ? format(data.actual_completion, 'yyyy-MM-dd') : undefined,
        notes: data.notes,
      });
    } else {
      await createContractor({
        ...data,
        start_date: data.start_date ? format(data.start_date, 'yyyy-MM-dd') : undefined,
        expected_completion: data.expected_completion ? format(data.expected_completion, 'yyyy-MM-dd') : undefined,
        actual_completion: data.actual_completion ? format(data.actual_completion, 'yyyy-MM-dd') : undefined,
      });
    }
  };

  const handleDeleteContractor = async (contractor: Contractor) => {
    if (contractor.id && confirm('Are you sure you want to delete this contractor?')) {
      await deleteContractor(contractor.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPhaseColor = (phase: string) => {
    const colors = {
      'design': 'bg-purple-100 text-purple-800 border-purple-200',
      'foundation': 'bg-orange-100 text-orange-800 border-orange-200',
      'structure': 'bg-blue-100 text-blue-800 border-blue-200',
      'mep': 'bg-green-100 text-green-800 border-green-200',
      'facade': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'fit_out': 'bg-pink-100 text-pink-800 border-pink-200',
      'landscaping': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'other': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[phase as keyof typeof colors] || colors.other;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Contractor Breakdown</CardTitle>
          </div>
          <CardDescription>
            Track contractor costs, phases, and delivery risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading contractors...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="feasly-card">
      <CardHeader>
        <div className="feasly-mobile-stack">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="feasly-title">Contractor Breakdown</CardTitle>
              <CardDescription className="feasly-description">
                Track contractor costs, phases, and delivery risk
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {contractors.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="flex items-center space-x-1"
              >
                <Download className="h-3 w-3" />
                <span>Export CSV</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleCreateContractor}
              className="flex items-center space-x-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add Contractor</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {contractors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No contractors added yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your contractor costs and delivery risk by adding your first contractor.
            </p>
            <Button onClick={handleCreateContractor}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Contractor
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {contractors.map((contractor) => (
                <div key={contractor.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{contractor.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(contractor.amount)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditContractor(contractor)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteContractor(contractor)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn("text-xs", getPhaseColor(contractor.phase))}>
                      {contractor.phase.replace('_', ' ')}
                    </Badge>
                    <Badge className={cn("text-xs", getStatusColor(contractor.status))}>
                      {contractor.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={cn("text-xs", getRiskColor(contractor.risk_rating))}>
                      {contractor.risk_rating} risk
                    </Badge>
                  </div>
                  
                  {contractor.contact_person && (
                    <p className="text-xs text-muted-foreground">
                      Contact: {contractor.contact_person}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Phase</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Expected Completion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractors.map((contractor) => (
                    <TableRow key={contractor.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contractor.name}</p>
                          {contractor.notes && (
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {contractor.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getPhaseColor(contractor.phase))}>
                          {contractor.phase.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(contractor.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getStatusColor(contractor.status))}>
                          {contractor.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getRiskColor(contractor.risk_rating))}>
                          {contractor.risk_rating}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contractor.contact_person ? (
                          <div className="text-sm">
                            <p>{contractor.contact_person}</p>
                            {contractor.contact_email && (
                              <p className="text-xs text-muted-foreground">
                                {contractor.contact_email}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(contractor.expected_completion)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditContractor(contractor)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteContractor(contractor)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>

      {/* Contractor Dialog */}
      <ContractorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contractor={selectedContractor}
        projectId={projectId}
        onSave={handleSaveContractor}
      />
    </Card>
  );
}