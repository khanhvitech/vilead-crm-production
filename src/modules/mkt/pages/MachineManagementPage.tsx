"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Download,
  Edit,
  Info,
  KeyRound,
  Monitor,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserCog,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/formatters';
import { User } from '../types';
import {
  MACHINE_ASSIGNEES,
  MOCK_MACHINES,
  type MachineAssignee,
  type MachineRecord,
} from '../mocks/mock-machines';

interface MachineManagementPageProps {
  currentUser: User;
  onNavigate?: (view: string, params?: any) => void;
}

interface AddMachineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignees: MachineAssignee[];
  existingNames: string[];
  onCompleted: (payload: {
    machineName: string;
    assigneeId: string;
    connectionCode: string;
  }) => void;
}

interface AssigneeComboboxProps {
  value: string | null;
  onChange: (id: string) => void;
  options: MachineAssignee[];
  placeholder: string;
  emptyText?: string;
  disabled?: boolean;
  triggerRef?: React.RefObject<HTMLButtonElement>;
}

const CONNECTION_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const generateConnectionCode = () => {
  const blocks = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => {
      const index = Math.floor(Math.random() * CONNECTION_CODE_ALPHABET.length);
      return CONNECTION_CODE_ALPHABET[index];
    }).join('')
  );

  return `VL-${blocks.join('-')}`;
};

const getSyncMeta = (lastSyncAt: string) => {
  const diffMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(lastSyncAt).getTime()) / 60000)
  );

  let relativeLabel = 'Vua xong';
  if (diffMinutes >= 1 && diffMinutes < 60) {
    relativeLabel = `${diffMinutes} phut truoc`;
  } else if (diffMinutes >= 60 && diffMinutes < 1440) {
    relativeLabel = `${Math.floor(diffMinutes / 60)} gio truoc`;
  } else if (diffMinutes >= 1440) {
    relativeLabel = `${Math.floor(diffMinutes / 1440)} ngay truoc`;
  }

  if (diffMinutes < 30) {
    return {
      status: 'online' as const,
      relativeLabel,
      textColor: 'text-[#455560]',
    };
  }

  if (diffMinutes < 1440) {
    return {
      status: 'offline' as const,
      relativeLabel,
      textColor: 'text-[#ffc542]',
    };
  }

  return {
    status: 'offline' as const,
    relativeLabel,
    textColor: 'text-[#ff6b72]',
  };
};

const getMachineNameError = (machineName: string, existingNames: string[]) => {
  const trimmedName = machineName.trim();

  if (!trimmedName) {
    return 'Vui long nhap ten may';
  }

  if (trimmedName.length > 50) {
    return 'Ten may toi da 50 ky tu';
  }

  const isDuplicate = existingNames.some(
    (existingName) => existingName.toLowerCase() === trimmedName.toLowerCase()
  );

  if (isDuplicate) {
    return 'Ten may da ton tai';
  }

  return '';
};

function AssigneeCombobox({
  value,
  onChange,
  options,
  placeholder,
  emptyText = 'Khong tim thay nhan vien',
  disabled = false,
  triggerRef,
}: AssigneeComboboxProps) {
  const [open, setOpen] = useState(false);
  const selectedAssignee = options.find((option) => option.id === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          type="button"
          role="combobox"
          disabled={disabled}
          aria-expanded={open}
          className="h-10 w-full justify-between px-3 text-left font-normal"
        >
          {selectedAssignee ? (
            <span className="flex min-w-0 items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#3e79f7] text-[12px] font-semibold text-white">
                  {selectedAssignee.avatar_initial}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block truncate text-[14px] text-[#1a3353]">
                  {selectedAssignee.full_name}
                </span>
                <span className="block truncate text-[12px] text-[#72849a]">
                  {selectedAssignee.department}
                </span>
              </span>
            </span>
          ) : (
            <span className="text-[14px] text-[#72849a]">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-[#72849a]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0"
      >
        <Command className="rounded-[10px]">
          <CommandInput placeholder="Tim nhan vien..." />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={`${option.full_name} ${option.department}`}
                  onSelect={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  className="rounded-[10px] px-3 py-2.5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#3e79f7] text-[12px] font-semibold text-white">
                        {option.avatar_initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-medium text-[#1a3353]">
                        {option.full_name}
                      </div>
                      <div className="truncate text-[12px] text-[#72849a]">
                        {option.department}
                      </div>
                    </div>
                  </div>
                  <Check
                    className={`h-4 w-4 text-[#3e79f7] ${
                      value === option.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function AddMachineDialog({
  open,
  onOpenChange,
  assignees,
  existingNames,
  onCompleted,
}: AddMachineDialogProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [machineName, setMachineName] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [connectionCode, setConnectionCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);
  const assigneeTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setMachineName('');
      setSelectedAssigneeId(null);
      setConnectionCode('');
      setCopied(false);
      setShowDiscardAlert(false);
    }
  }, [open]);

  const machineNameError = getMachineNameError(machineName, existingNames);
  const isStepOneValid = Boolean(selectedAssigneeId) && !machineNameError;

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    if (currentStep === 2 && connectionCode && !copied) {
      setShowDiscardAlert(true);
      return;
    }

    onOpenChange(false);
  };

  const handleNextStep = () => {
    if (!isStepOneValid || !selectedAssigneeId) {
      return;
    }

    if (!connectionCode) {
      setConnectionCode(generateConnectionCode());
    }

    setCurrentStep(2);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(connectionCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleDone = () => {
    if (!selectedAssigneeId || !connectionCode) {
      return;
    }

    onCompleted({
      machineName: machineName.trim(),
      assigneeId: selectedAssigneeId,
      connectionCode,
    });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
          <DialogHeader className="relative gap-2 border-b border-[#e6ebf1] px-6 pb-4 pt-6">
            <div className="flex items-start gap-3 pr-10">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f7ff]">
                <Plus className="h-4 w-4 text-[#3e79f7]" />
              </div>
              <div>
                <DialogTitle className="text-[16px] font-semibold text-[#1a3353]">
                  Them may moi
                </DialogTitle>
                <DialogDescription className="mt-1 text-[13px] text-[#72849a]">
                  Tao ma ket noi cho mot may tinh moi
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="border-b border-[#e6ebf1] px-6 py-4">
            <div className="flex items-center gap-3">
              {[
                {
                  step: 1,
                  label: 'Thong tin may',
                  completed: currentStep > 1,
                  active: currentStep === 1,
                },
                {
                  step: 2,
                  label: 'Ma ket noi',
                  completed: false,
                  active: currentStep === 2,
                },
              ].map((item, index) => (
                <React.Fragment key={item.step}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold ${
                        item.completed
                          ? 'bg-[#2dc56a] text-white'
                          : item.active
                            ? 'bg-[#3e79f7] text-white'
                            : 'bg-[#e6ebf1] text-[#72849a]'
                      }`}
                    >
                      {item.completed ? <Check className="h-4 w-4" /> : item.step}
                    </div>
                    <span
                      className={`text-[13px] ${
                        item.active || item.completed
                          ? 'font-semibold text-[#1a3353]'
                          : 'text-[#72849a]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {index === 0 && <div className="h-px flex-1 bg-[#e6ebf1]" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="px-6 py-6">
            {currentStep === 1 ? (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[14px] font-medium text-[#1a3353]">
                    Ten may <span className="text-[#ff6b72]">*</span>
                  </label>
                  <Input
                    value={machineName}
                    maxLength={50}
                    placeholder="VD: MAY-NV-HUONG-01"
                    className={machineNameError ? 'border-[#ff6b72] focus-visible:border-[#ff6b72] focus-visible:ring-[rgba(255,107,114,0.15)]' : ''}
                    onChange={(event) => setMachineName(event.target.value.toUpperCase())}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter') {
                        return;
                      }

                      event.preventDefault();
                      if (isStepOneValid) {
                        handleNextStep();
                        return;
                      }

                      assigneeTriggerRef.current?.focus();
                    }}
                  />
                  {machineNameError ? (
                    <p className="text-[12px] text-[#ff6b72]">{machineNameError}</p>
                  ) : (
                    <p className="text-[12px] text-[#72849a]">
                      Quy uoc: MAY-&lt;VIET TAT TEN NV&gt;-&lt;SO THU TU&gt;
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[14px] font-medium text-[#1a3353]">
                    Gan cho nhan vien <span className="text-[#ff6b72]">*</span>
                  </label>
                  <AssigneeCombobox
                    value={selectedAssigneeId}
                    onChange={setSelectedAssigneeId}
                    options={assignees}
                    triggerRef={assigneeTriggerRef}
                    placeholder="Chon nhan vien..."
                  />
                </div>

                <div className="rounded-[10px] border border-[#d9e8ff] border-l-[3px] border-l-[#3e79f7] bg-[#f0f7ff] p-3">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#3e79f7]" />
                    <p className="text-[13px] leading-5 text-[#455560]">
                      Sau khi tao, ban se nhan duoc ma ket noi. Giao ma cho nhan vien de
                      cai Agent va nhap.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#2dc56a]" />
                  <p className="text-[14px] text-[#1a3353]">
                    Da tao ma ket noi cho may{' '}
                    <span className="font-semibold">{machineName.trim()}</span>
                  </p>
                </div>

                <div className="rounded-[10px] border border-[#e6ebf1] p-6">
                  <p className="mb-3 text-[13px] text-[#72849a]">Ma ket noi</p>
                  <div className="rounded-[10px] border border-[#e6ebf1] bg-[#fafafb] px-4 py-5 text-center">
                    <p className="font-mono text-[20px] font-semibold tracking-[0.1em] text-[#1a3353]">
                      {connectionCode}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      size="sm"
                      variant={copied ? 'secondary' : 'outline'}
                      className={
                        copied
                          ? 'border-transparent bg-[rgba(45,197,106,0.15)] text-[#2dc56a] hover:bg-[rgba(45,197,106,0.2)] hover:text-[#2dc56a]'
                          : ''
                      }
                      onClick={handleCopyCode}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Da sao chep
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy ma
                        </>
                      )}
                    </Button>
                    <span className="text-[12px] text-[#72849a]">Ma co hieu luc 24h</span>
                  </div>
                </div>

                <div className="rounded-[10px] bg-[#fafafb] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Download className="h-4 w-4 text-[#3e79f7]" />
                    <p className="text-[14px] font-semibold text-[#1a3353]">
                      Huong dan cho nhan vien:
                    </p>
                  </div>
                  <ol className="space-y-2 pl-5 text-[13px] leading-5 text-[#455560]">
                    <li>1. Tai MKT Sync Agent tai cong tai noi bo cua cong ty.</li>
                    <li>2. Cai dat va mo Agent tren may.</li>
                    <li>3. Dan ma ket noi o tren vao Agent.</li>
                    <li>4. May se tu xuat hien trong danh sach sau 1-2 phut.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-[#e6ebf1] px-6 pb-6 pt-4">
            {currentStep === 1 ? (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Huy
                </Button>
                <Button disabled={!isStepOneValid} onClick={handleNextStep}>
                  Tiep theo
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="h-4 w-4" />
                  Quay lai
                </Button>
                <Button onClick={handleDone}>Xong</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDiscardAlert} onOpenChange={setShowDiscardAlert}>
        <AlertDialogContent className="max-w-md rounded-[10px] border border-[#e6ebf1] bg-white p-6">
          <AlertDialogHeader className="space-y-2 text-left">
            <AlertDialogTitle className="text-[16px] font-semibold text-[#1a3353]">
              Ban da tao ma nhung chua copy
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] leading-6 text-[#72849a]">
              Thoat luc nay se khong luu lai ma ket noi. Ban co muon tiep tuc?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3 sm:space-x-0">
            <AlertDialogCancel className="mt-0">O lai</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#ff6b72] text-white hover:bg-[#d9505c]"
              onClick={() => {
                setShowDiscardAlert(false);
                onOpenChange(false);
              }}
            >
              Tiep tuc thoat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  accentClassName,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accentClassName: string;
}) => (
  <Card className="border border-[#e6ebf1] bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[13px] text-[#72849a]">{label}</p>
        <p className="mt-2 text-[22px] font-bold text-[#1a3353]">{value}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${accentClassName}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </Card>
);

export default function MachineManagementPage({
  currentUser,
  onNavigate,
}: MachineManagementPageProps) {
  const [machines, setMachines] = useState<MachineRecord[]>(MOCK_MACHINES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showAddMachineDialog, setShowAddMachineDialog] = useState(false);
  const [renameTarget, setRenameTarget] = useState<MachineRecord | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [reassignTarget, setReassignTarget] = useState<MachineRecord | null>(null);
  const [reassignAssigneeId, setReassignAssigneeId] = useState<string | null>(null);
  const [connectionTarget, setConnectionTarget] = useState<MachineRecord | null>(null);
  const [copiedConnectionMachineId, setCopiedConnectionMachineId] = useState<string | null>(null);
  const [disableTarget, setDisableTarget] = useState<MachineRecord | null>(null);

  useEffect(() => {
    if (currentUser.role === 'employee') {
      toast({
        title: 'Bạn không có quyền truy cập',
        description: 'Chi Admin, PM va Team Leader được truy cập quản lý máy tính.',
        variant: 'destructive',
      });
      onNavigate?.('mkt-dashboard');
    }
  }, [currentUser.role, onNavigate]);

  const assigneeMap = useMemo(
    () => new Map(MACHINE_ASSIGNEES.map((assignee) => [assignee.id, assignee])),
    []
  );

  const assignableEmployees = useMemo(
    () =>
      MACHINE_ASSIGNEES.filter(
        (assignee) =>
          assignee.role === 'employee' &&
          assignee.employment_status === 'active' &&
          (currentUser.role !== 'teamLeader' || assignee.department === currentUser.department)
      ),
    [currentUser.department, currentUser.role]
  );

  const scopedMachines = useMemo(() => {
    if (currentUser.role === 'admin' || currentUser.role === 'pm') {
      return machines;
    }

    if (currentUser.role === 'teamLeader') {
      return machines.filter((machine) => {
        if (!machine.assigned_user_id) {
          return true;
        }

        const assignee = assigneeMap.get(machine.assigned_user_id);
        return assignee?.department === currentUser.department;
      });
    }

    return [];
  }, [assigneeMap, currentUser.department, currentUser.role, machines]);

  const filteredMachines = useMemo(() => {
    return scopedMachines.filter((machine) => {
      const syncMeta = getSyncMeta(machine.last_sync_at);
      const assignee = machine.assigned_user_id
        ? assigneeMap.get(machine.assigned_user_id) ?? null
        : null;

      const matchesSearch = machine.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || syncMeta.status === statusFilter;

      let matchesAssignee = true;
      if (assigneeFilter.startsWith('team:')) {
        matchesAssignee = assignee?.department === assigneeFilter.replace('team:', '');
      } else if (assigneeFilter.startsWith('user:')) {
        matchesAssignee = machine.assigned_user_id === assigneeFilter.replace('user:', '');
      }

      return matchesSearch && matchesStatus && matchesAssignee;
    });
  }, [assigneeFilter, assigneeMap, scopedMachines, searchQuery, statusFilter]);

  const summary = useMemo(() => {
    const onlineCount = scopedMachines.filter(
      (machine) => getSyncMeta(machine.last_sync_at).status === 'online'
    ).length;

    const assignedEmployeeCount = new Set(
      scopedMachines
        .filter((machine) => {
          if (!machine.assigned_user_id) {
            return false;
          }

          const assignee = assigneeMap.get(machine.assigned_user_id);
          return assignee?.employment_status === 'active';
        })
        .map((machine) => machine.assigned_user_id as string)
    ).size;

    return {
      total: scopedMachines.length,
      online: onlineCount,
      offline: scopedMachines.length - onlineCount,
      assigned: assignedEmployeeCount,
    };
  }, [assigneeMap, scopedMachines]);

  const assigneeFilterOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [{ value: 'all', label: 'Tat ca' }];

    if (currentUser.role === 'teamLeader') {
      options.push({
        value: `team:${currentUser.department}`,
        label: `Nhom ${currentUser.department}`,
      });
    } else {
      options.push({ value: 'team:Team A', label: 'Nhom Team A' });
      options.push({ value: 'team:Team B', label: 'Nhom Team B' });
    }

    assignableEmployees.forEach((employee) => {
      options.push({
        value: `user:${employee.id}`,
        label: employee.full_name,
      });
    });

    return options;
  }, [assignableEmployees, currentUser.department, currentUser.role]);

  const renameError = renameTarget
    ? getMachineNameError(
        renameDraft,
        machines
          .filter((machine) => machine.id !== renameTarget.id)
          .map((machine) => machine.name)
      )
    : '';

  const handleCopyConnectionCode = async (machine: MachineRecord) => {
    await navigator.clipboard.writeText(machine.connection_code);
    setCopiedConnectionMachineId(machine.id);
    window.setTimeout(() => setCopiedConnectionMachineId(null), 2000);
  };

  if (currentUser.role === 'employee') {
    return null;
  }

  return (
    <TooltipProvider delayDuration={120}>
      <div className="min-h-full bg-[#f7f7f8]">

        <div className="mb-6 flex flex-col gap-4">
          <div>
          <h2 className="text-lg font-semibold text-[#1a3353]">Quản lý máy tính</h2>
              <p className="text-[#1a3353] font-medium mb-4">Theo dõi máy được gắn cho nhân viên và quản lý mã kết nối Agent</p>
          </div>

          {currentUser.role === 'admin' && (
            <div className="flex">
            <Button onClick={() => setShowAddMachineDialog(true)}>
              <Plus className="h-4 w-4" />
              Thêm máy
            </Button>
            </div>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Monitor}
            label="Tong may"
            value={summary.total}
            accentClassName="bg-[#f0f7ff] text-[#3e79f7]"
          />
          <SummaryCard
            icon={Wifi}
            label="Online"
            value={summary.online}
            accentClassName="bg-[rgba(45,197,106,0.15)] text-[#2dc56a]"
          />
          <SummaryCard
            icon={WifiOff}
            label="Offline"
            value={summary.offline}
            accentClassName="bg-[#f7f7f8] text-[#72849a]"
          />
          <SummaryCard
            icon={Users}
            label="NV co may"
            value={summary.assigned}
            accentClassName="bg-[#fff7e6] text-[#ffc542]"
          />
        </div>

        <Card className="mb-6 border border-[#e6ebf1] bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <Select
              value={statusFilter}
              onValueChange={(value: 'all' | 'online' | 'offline') => setStatusFilter(value)}
            >
              <SelectTrigger className="h-10 w-full rounded-[10px] lg:w-[180px]">
                <SelectValue placeholder="Trang thai" />
              </SelectTrigger>
              <SelectContent className="rounded-[10px]">
                <SelectItem value="all">Tat ca</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="h-10 w-full rounded-[10px] lg:w-[220px]">
                <SelectValue placeholder="NV / Nhom" />
              </SelectTrigger>
              <SelectContent className="rounded-[10px]">
                {assigneeFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#72849a]" />
              <Input
                value={searchQuery}
                placeholder="Tim theo ten may..."
                className="pl-10"
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>
        </Card>

        {scopedMachines.length === 0 ? (
          <Card className="border border-[#e6ebf1] bg-white p-10 text-center">
            <Monitor className="mx-auto h-12 w-12 text-[#72849a]" />
            <h2 className="mt-4 text-[16px] font-semibold text-[#1a3353]">
              Chua co may tinh nao ket noi
            </h2>
            <p className="mt-2 text-[14px] text-[#72849a]">
              Nhan Them may de bat dau tao ma ket noi cho nhan vien.
            </p>
            {currentUser.role === 'admin' && (
              <div className="mt-6">
                <Button onClick={() => setShowAddMachineDialog(true)}>
                  <Plus className="h-4 w-4" />
                  Them may
                </Button>
              </div>
            )}
          </Card>
        ) : filteredMachines.length === 0 ? (
          <Card className="border border-[#e6ebf1] bg-white p-10 text-center">
            <Search className="mx-auto h-12 w-12 text-[#72849a]" />
            <h2 className="mt-4 text-[16px] font-semibold text-[#1a3353]">
              Khong tim thay may phu hop
            </h2>
            <p className="mt-2 text-[14px] text-[#72849a]">
              Thu doi bo loc hoac xoa tu khoa tim kiem hien tai.
            </p>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setAssigneeFilter('all');
                }}
              >
                Xoa bo loc
              </Button>
            </div>
          </Card>
        ) : (
          <Table className="bg-white">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px]">Ten may</TableHead>
                <TableHead className="w-[240px]">NV duoc gan</TableHead>
                <TableHead className="w-[160px]">Dong bo cuoi</TableHead>
                <TableHead className="w-[140px]">Trang thai</TableHead>
                {currentUser.role === 'admin' && <TableHead className="w-[80px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachines.map((machine) => {
                const syncMeta = getSyncMeta(machine.last_sync_at);
                const assignee = machine.assigned_user_id
                  ? assigneeMap.get(machine.assigned_user_id) ?? null
                  : null;

                return (
                  <TableRow
                    key={machine.id}
                    className="h-[70px] even:bg-[#fafafb]"
                  >
                    <TableCell>
                      <span className="font-mono text-[14px] font-medium text-[#1a3353]">
                        {machine.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {assignee ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#3e79f7] text-[12px] font-semibold text-white">
                              {assignee.avatar_initial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="truncate text-[14px] font-medium text-[#1a3353]">
                              {assignee.full_name}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#72849a]">
                              <span>{assignee.department}</span>
                              {assignee.employment_status === 'inactive' && (
                                <Badge
                                  variant="outline"
                                  className="border-[#d0d4d7] bg-[#f7f7f8] text-[#72849a]"
                                >
                                  Da nghi
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[13px] text-[#72849a]">
                          <AlertCircle className="h-4 w-4 text-[#ffc542]" />
                          Chua gan
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={`cursor-default text-[14px] ${syncMeta.textColor}`}
                          >
                            {syncMeta.relativeLabel}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {formatDate(machine.last_sync_at)}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {syncMeta.status === 'online' ? (
                        <Badge variant="success" className="gap-1.5 px-2.5 py-1">
                          <Wifi className="h-3.5 w-3.5" />
                          Online
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1.5 border-[#d0d4d7] bg-[#f7f7f8] px-2.5 py-1 text-[#72849a]"
                        >
                          <WifiOff className="h-3.5 w-3.5" />
                          Offline
                        </Badge>
                      )}
                    </TableCell>
                    {currentUser.role === 'admin' && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-[10px]">
                            <DropdownMenuItem
                              onClick={() => {
                                setRenameTarget(machine);
                                setRenameDraft(machine.name);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              Sua ten may
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setReassignTarget(machine);
                                setReassignAssigneeId(machine.assigned_user_id);
                              }}
                            >
                              <UserCog className="h-4 w-4" />
                              Doi NV gan
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setConnectionTarget(machine)}>
                              <KeyRound className="h-4 w-4" />
                              Xem ma ket noi
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-[#ff6b72] focus:text-[#ff6b72]"
                              onClick={() => setDisableTarget(machine)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Vo hieu hoa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <AddMachineDialog
          open={showAddMachineDialog}
          onOpenChange={setShowAddMachineDialog}
          assignees={assignableEmployees}
          existingNames={machines.map((machine) => machine.name)}
          onCompleted={({ machineName, assigneeId }) => {
            const assignee = assigneeMap.get(assigneeId);

            toast({
              title: 'Da them may vao danh sach',
              description: assignee
                ? `Ma ket noi da duoc tao cho ${machineName} va gan cho ${assignee.full_name}. May se xuat hien sau khi nhan vien nhap ma.`
                : 'May se xuat hien sau khi nhan vien nhap ma ket noi.',
            });
          }}
        />

        <Dialog open={Boolean(renameTarget)} onOpenChange={(open) => !open && setRenameTarget(null)}>
          <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
            <DialogHeader className="px-6 pb-4 pt-6">
              <DialogTitle>Sua ten may</DialogTitle>
              <DialogDescription>Doi ten hien thi cho may tinh da duoc tao.</DialogDescription>
            </DialogHeader>
            <div className="px-6 py-5">
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#1a3353]">
                  Ten may
                </label>
                <Input
                  value={renameDraft}
                  maxLength={50}
                  className={
                    renameError
                      ? 'border-[#ff6b72] focus-visible:border-[#ff6b72] focus-visible:ring-[rgba(255,107,114,0.15)]'
                      : ''
                  }
                  onChange={(event) => setRenameDraft(event.target.value.toUpperCase())}
                />
                {renameError ? (
                  <p className="text-[12px] text-[#ff6b72]">{renameError}</p>
                ) : (
                  <p className="text-[12px] text-[#72849a]">
                    Ten may can duy nhat trong danh sach hien tai.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="px-6 pb-6 pt-4">
              <Button variant="outline" onClick={() => setRenameTarget(null)}>
                Huy
              </Button>
              <Button
                disabled={Boolean(renameError)}
                onClick={() => {
                  if (!renameTarget || renameError) {
                    return;
                  }

                  setMachines((previousMachines) =>
                    previousMachines.map((machine) =>
                      machine.id === renameTarget.id
                        ? { ...machine, name: renameDraft.trim() }
                        : machine
                    )
                  );
                  setRenameTarget(null);
                  toast({
                    title: 'Da cap nhat ten may',
                    description: `May da duoc doi ten thanh ${renameDraft.trim()}.`,
                  });
                }}
              >
                Luu thay doi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(reassignTarget)}
          onOpenChange={(open) => !open && setReassignTarget(null)}
        >
          <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
            <DialogHeader className="px-6 pb-4 pt-6">
              <DialogTitle>Doi nhan vien gan may</DialogTitle>
              <DialogDescription>Cap nhat nguoi phu trach cho may tinh nay.</DialogDescription>
            </DialogHeader>
            <div className="px-6 py-5">
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#1a3353]">
                  Nhan vien phu trach
                </label>
                <AssigneeCombobox
                  value={reassignAssigneeId}
                  onChange={setReassignAssigneeId}
                  options={assignableEmployees}
                  placeholder="Chon nhan vien..."
                />
              </div>
            </div>
            <DialogFooter className="px-6 pb-6 pt-4">
              <Button variant="outline" onClick={() => setReassignTarget(null)}>
                Huy
              </Button>
              <Button
                disabled={!reassignAssigneeId}
                onClick={() => {
                  if (!reassignTarget || !reassignAssigneeId) {
                    return;
                  }

                  const nextAssignee = assigneeMap.get(reassignAssigneeId);
                  setMachines((previousMachines) =>
                    previousMachines.map((machine) =>
                      machine.id === reassignTarget.id
                        ? { ...machine, assigned_user_id: reassignAssigneeId }
                        : machine
                    )
                  );
                  setReassignTarget(null);
                  toast({
                    title: 'Da doi nhan vien gan may',
                    description: nextAssignee
                      ? `${reassignTarget.name} da duoc gan cho ${nextAssignee.full_name}.`
                      : 'Thong tin nhan vien da duoc cap nhat.',
                  });
                }}
              >
                Cap nhat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(connectionTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setConnectionTarget(null);
              setCopiedConnectionMachineId(null);
            }
          }}
        >
          <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
            <DialogHeader className="px-6 pb-4 pt-6">
              <DialogTitle>Ma ket noi</DialogTitle>
              <DialogDescription>
                Xem lai ma ket noi cua may {connectionTarget?.name}.
              </DialogDescription>
            </DialogHeader>
            {connectionTarget && (
              <>
                <div className="px-6 py-5">
                  <div className="rounded-[10px] border border-[#e6ebf1] p-5">
                    <p className="mb-3 text-[13px] text-[#72849a]">Ma ket noi hien tai</p>
                    <div className="rounded-[10px] border border-[#e6ebf1] bg-[#fafafb] px-4 py-5 text-center">
                      <p className="font-mono text-[20px] font-semibold tracking-[0.1em] text-[#1a3353]">
                        {connectionTarget.connection_code}
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="px-6 pb-6 pt-4">
                  <Button variant="outline" onClick={() => setConnectionTarget(null)}>
                    Dong
                  </Button>
                  <Button
                    variant={
                      copiedConnectionMachineId === connectionTarget.id ? 'secondary' : 'default'
                    }
                    className={
                      copiedConnectionMachineId === connectionTarget.id
                        ? 'bg-[rgba(45,197,106,0.15)] text-[#2dc56a] hover:bg-[rgba(45,197,106,0.2)] hover:text-[#2dc56a]'
                        : ''
                    }
                    onClick={() => handleCopyConnectionCode(connectionTarget)}
                  >
                    {copiedConnectionMachineId === connectionTarget.id ? (
                      <>
                        <Check className="h-4 w-4" />
                        Da sao chep
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy ma
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={Boolean(disableTarget)} onOpenChange={(open) => !open && setDisableTarget(null)}>
          <AlertDialogContent className="max-w-md rounded-[10px] border border-[#e6ebf1] bg-white p-6">
            <AlertDialogHeader className="space-y-2 text-left">
              <AlertDialogTitle className="text-[16px] font-semibold text-[#1a3353]">
                Vo hieu hoa may {disableTarget?.name}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[14px] leading-6 text-[#72849a]">
                May se khong con xuat hien trong danh sach quan ly va ma ket noi hien tai se
                khong dung duoc nua.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4 gap-3 sm:space-x-0">
              <AlertDialogCancel className="mt-0">Huy</AlertDialogCancel>
              <AlertDialogAction
                className="bg-[#ff6b72] text-white hover:bg-[#d9505c]"
                onClick={() => {
                  if (!disableTarget) {
                    return;
                  }

                  setMachines((previousMachines) =>
                    previousMachines.filter((machine) => machine.id !== disableTarget.id)
                  );
                  toast({
                    title: 'Da vo hieu hoa may',
                    description: `${disableTarget.name} da duoc go khoi danh sach.`,
                  });
                  setDisableTarget(null);
                }}
              >
                Vo hieu hoa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
