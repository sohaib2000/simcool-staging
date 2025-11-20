'use client';

import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUserMutation } from '@/lib/apiHandler/useApiMutation';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { GetTicketDetailsRes, Ticket, TicketDetails, TicketMessage, TicketsResponse } from '@/types/type';

import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Eye,
    Filter,
    Hash,
    Headphones,
    MessageCircle,
    Plus,
    RefreshCw,
    Search,
    Send
} from 'lucide-react';
import moment from 'moment';

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}

const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => (
    <textarea
        className={`block w-full resize-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm ${className}`}
        {...props}
    />
);

// Create Ticket DTO Interface
export interface CreateTicketDTO {
    subject: string;
    message: string;
}

// Alert type
interface AlertType {
    type: 'default' | 'destructive' | 'success';
    message: string;
}

interface ChatModalPropsType {
    ticket: number | null;
    isOpen: boolean;
    onClose: () => void;
    isPending: boolean;
    ticketDetails: TicketDetails | undefined;
    onSendMessage: (ticketId: number, message: string) => void;
}

// Chat Modal Component
const ChatModal: React.FC<ChatModalPropsType> = ({
    ticket,
    isOpen,
    onClose,
    onSendMessage,
    isPending,
    ticketDetails
}) => {
    const [message, setMessage] = useState<string>('');

    const currentTicket = ticketDetails || (ticket ? ({ id: ticket } as Ticket) : null);

    // FIXED: Simplified canSendMessage logic - users can send messages anytime except when ticket is closed
    const canSendMessage = (): boolean => {
        if (!currentTicket || currentTicket.status === 'closed') return false;

        // Check if there are any messages
        if (!currentTicket.messages || currentTicket.messages.length === 0) {
            return true; // User can send first message
        }

        // Find the last message
        const lastMessage = currentTicket.messages[currentTicket.messages.length - 1];

        // User can send message if:
        // 1. Last message was from admin, OR
        // 2. There are no messages yet
        return lastMessage.sender_type === 'admin';
    };

    const handleSend = (): void => {
        if (!message.trim()) {
            return;
        }

        if (!canSendMessage() || !currentTicket) {
            return;
        }

        onSendMessage(currentTicket.id, message.trim());
        setMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!currentTicket) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[90vh] max-w-2xl flex-col p-0'>
                <DialogHeader className='border-b p-4'>
                    <DialogTitle className='flex items-center gap-3'>
                        <MessageCircle className='h-5 w-5 text-blue-600' />
                        <div>
                            <div className='text-lg font-semibold text-gray-900'>{currentTicket?.subject}</div>
                            <p className='text-sm font-normal text-gray-500'>Ticket #{currentTicket?.id}</p>
                        </div>
                    </DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                {/* Messages */}
                <div className='max-h-[400px] min-h-[300px] flex-1 space-y-4 overflow-y-auto p-4'>
                    {currentTicket?.messages?.map((msg: TicketMessage) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[70%] rounded-lg px-3 py-2 ${
                                    msg.sender_type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                                }`}>
                                <p className='text-sm'>{msg.message}</p>
                                <p
                                    className={`mt-1 text-xs ${
                                        msg.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                    {new Date(msg.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}

                    {(!currentTicket?.messages || currentTicket.messages.length === 0) && (
                        <div className='py-8 text-center text-gray-500'>
                            <MessageCircle className='mx-auto mb-2 h-8 w-8 text-gray-300' />
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    )}
                </div>

                {/* Input */}
                <DialogFooter className='border-t p-4'>
                    {currentTicket?.status === 'closed' ? (
                        <div className='w-full rounded-md bg-gray-50 p-3 text-center text-gray-600'>
                            This ticket is closed. No new messages can be sent.
                        </div>
                    ) : (
                        <div className='flex w-full gap-2'>
                            <Textarea
                                name='sendingMessageName'
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={canSendMessage() ? 'Type your message...' : 'Wait for admin response...'}
                                rows={2}
                                className='flex-1'
                                disabled={isPending || !canSendMessage()}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!message.trim() || isPending || !canSendMessage()}
                                className='self-end'>
                                <Send className='h-4 w-4' />
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface CreateTicketModalPropsType {
    isOpen: boolean;
    onClose: () => void;
    onCreateTicket: (ticketData: CreateTicketDTO) => void;
    isPending: boolean;
}

// Create Ticket Modal
const CreateTicketModal: React.FC<CreateTicketModalPropsType> = ({ isOpen, onClose, onCreateTicket, isPending }) => {
    const [subject, setSubject] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [alert, setAlert] = useState<AlertType | null>(null);

    const handleCreate = (): void => {
        if (!subject.trim()) {
            setAlert({ type: 'destructive', message: 'Please enter a subject' });
            return;
        }
        if (!message.trim()) {
            setAlert({ type: 'destructive', message: 'Please enter a message' });
            return;
        }

        onCreateTicket({
            subject: subject.trim(),
            message: message.trim()
        });
        setSubject('');
        setMessage('');
        setAlert(null);
    };

    const handleClose = (): void => {
        setSubject('');
        setMessage('');
        setAlert(null);
        onClose();
    };

    // Clear alert after 3 seconds
    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                setAlert(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className='max-w-md'>
                <DialogHeader>
                    <DialogTitle>Create New Ticket</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                {alert && (
                    <div
                        className={`rounded-md border px-4 py-3 ${
                            alert.type === 'destructive'
                                ? 'border-red-200 bg-red-50 text-red-800'
                                : alert.type === 'success'
                                  ? 'border-green-200 bg-green-50 text-green-800'
                                  : 'border-blue-200 bg-blue-50 text-blue-800'
                        }`}>
                        {alert.message}
                    </div>
                )}

                <div className='space-y-4'>
                    <div>
                        <label htmlFor='subject' className='mb-1 block text-sm font-medium text-gray-700'>
                            Subject
                        </label>
                        <Input
                            id='subject'
                            name='subject'
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder='Brief description of your issue'
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <label htmlFor='sendMessage' className='mb-1 block text-sm font-medium text-gray-700'>
                            Message
                        </label>
                        <Textarea
                            name='sendMessage'
                            id='sendMessage'
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder='Provide detailed information about your issue'
                            rows={4}
                            disabled={isPending}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant='outline' onClick={handleClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={!subject.trim() || !message.trim() || isPending}>
                        {isPending ? 'Creating...' : 'Create Ticket'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Priority type
type Priority = 'high' | 'medium' | 'low';

// Status type
type Status = 'open' | 'closed';

// Main Component
const CustomerSupportPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
    const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    // API hooks
    const {
        data: ticketData,
        isLoading,
        refetch: refetchTickets,
        isRefetching
    } = useProtectedApiHandler<TicketsResponse>({
        url: `/tickets?page=${page}`
    });

    // FIXED: Added refetch for ticket details to get fresh data
    const {
        data: ticketDetails,
        isLoading: isLoadingDetails,
        refetch: refetchTicketDetails
    } = useProtectedApiHandler<GetTicketDetailsRes>({
        url: `/tickets/${selectedTicket}`,
        enabled: !!selectedTicket
    });

    const { mutate: createNewTicket, isPending: isCreatingTicket } = useUserMutation({
        url: '/tickets',
        method: 'POST'
    });

    const { mutate: sendMessage, isPending: isSendingMessage } = useUserMutation({
        url: selectedTicket ? `/tickets/${selectedTicket}/messages` : '/tickets/0/messages',
        method: 'POST'
    });

    // Extract tickets data
    const apiData = ticketData?.data;
    const tickets = apiData?.data || [];
    const totalTickets = apiData?.total || 0;
    const currentPage = apiData?.current_page || 1;
    const lastPage = apiData?.last_page || 1;

    // Priority mapping
    const getPriority = (ticket: Ticket): Priority => {
        if (ticket.subject.toLowerCase().includes('urgent') || ticket.status === 'open') {
            return 'high';
        }
        return 'medium';
    };

    // Status configuration
    const statusConfig: Record<Status, { color: string; label: string }> = {
        open: {
            color: 'bg-green-100 text-green-700',
            label: 'Open'
        },
        closed: {
            color: 'bg-gray-100 text-gray-700',
            label: 'Closed'
        }
    };

    // Priority configuration
    const priorityConfig: Record<Priority, { color: string; label: string }> = {
        high: { color: 'bg-red-100 text-red-700', label: 'High' },
        medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
        low: { color: 'bg-blue-100 text-blue-700', label: 'Low' }
    };

    // Filter tickets
    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch =
            ticket.id.toString().includes(searchQuery.toLowerCase()) ||
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

        const matchesDate = !dateFilter || new Date(ticket.created_at).toISOString().split('T')[0] === dateFilter;

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Handlers
    const handleRefresh = (): void => {
        setRefreshTrigger((prev) => prev + 1);
        if (refetchTickets) {
            refetchTickets();
        }
    };

    const handleCreateTicket = (ticketData: CreateTicketDTO): void => {
        createNewTicket(ticketData, {
            onSuccess: (response: any) => {
                setIsCreateModalOpen(false);
                handleRefresh();
                // Show success message or redirect to new ticket
            },
            onError: (error: any) => {
                alert(error.message || 'Failed to create ticket. Please try again.');
                console.error('Failed to create ticket:', error);
            }
        });
    };

    // FIXED: Enhanced handleSendMessage to properly refresh both API calls
    const handleSendMessage = (ticketId: number, message: string): void => {
        sendMessage(
            { message },
            {
                onSuccess: (response: any) => {
                    // First refresh ticket details to show new message immediately
                    if (refetchTicketDetails) {
                        refetchTicketDetails();
                    }
                    // Then refresh main tickets list to update last message preview
                    if (refetchTickets) {
                        refetchTickets();
                    }
                },
                onError: (error: any) => {
                    console.error('Failed to send message:', error);
                }
            }
        );
    };

    const openChatModal = (ticketId: number): void => {
        setSelectedTicket(ticketId);
        setIsChatModalOpen(true);
    };

    const closeChatModal = (): void => {
        setIsChatModalOpen(false);
        setSelectedTicket(null);
    };

    if (isLoading) {
        return (
            <div className='flex min-h-[400px] items-center justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
            </div>
        );
    }
    if (isRefetching) {
        return (
            <div className='flex min-h-[400px] items-center justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
            </div>
        );
    }

    return (
        <div className='space-y-6 p-4 sm:p-6'>
            {/* Page Header */}
            <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                <div className='flex items-center gap-2'>
                    <Headphones className='h-6 w-6 text-gray-700' />
                    <h2 className='text-2xl font-bold text-gray-900'>Customer Support</h2>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className='mr-2 h-4 w-4' />
                    New Ticket
                </Button>
            </div>

            {/* Filters Section */}
            <Card>
                <CardContent className='p-6'>
                    <div className='flex flex-col gap-4 lg:flex-row'>
                        {/* Search */}
                        <div className='flex-1'>
                            <div className='relative'>
                                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                                <Input
                                    name='searchTicketId'
                                    placeholder='Search by ticket ID or subject...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='pl-10'
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className='flex items-center gap-2'>
                            <Filter className='h-4 w-4 text-gray-500' />
                            <select
                                name='ticketStatueDropdown'
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className='min-w-[120px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'>
                                <option value='all'>All Status</option>
                                <option value='open'>Open</option>
                                <option value='closed'>Closed</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className='flex items-center gap-2'>
                            <Calendar className='h-4 w-4 text-gray-500' />
                            <Input
                                name='dateFilter'
                                type='date'
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className='min-w-[150px]'
                            />
                        </div>

                        {/* Refresh Button */}
                        <Button variant='outline' size='sm' onClick={handleRefresh}>
                            <RefreshCw className='mr-2 h-4 w-4' />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tickets List */}
            <div className='space-y-4'>
                {filteredTickets.length === 0 ? (
                    <Card>
                        <CardContent className='p-12 text-center'>
                            <Headphones className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                            <h3 className='mb-2 text-lg font-medium text-gray-900'>No tickets found</h3>
                            <p className='text-gray-500'>Try adjusting your search or filter criteria.</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredTickets.map((ticket) => {
                        const priority = getPriority(ticket);
                        const lastMessage = ticket.messages?.[ticket.messages.length - 1];

                        return (
                            <Card key={ticket.id} className='transition-shadow duration-200 hover:shadow-lg'>
                                <CardContent className='p-4 sm:p-6'>
                                    <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-6 lg:items-center'>
                                        {/* Ticket ID */}
                                        <div className='lg:col-span-1'>
                                            <p className='mb-1 text-sm text-gray-500'>Ticket ID</p>
                                            <div className='flex items-center gap-2'>
                                                <Hash className='h-4 w-4 text-gray-400' />
                                                <p className='font-medium text-gray-900'>TKT-{ticket.id}</p>
                                            </div>
                                        </div>

                                        {/* Subject & Last Message */}
                                        <div className='lg:col-span-2'>
                                            <p className='mb-1 text-sm text-gray-500'>Subject & Last Message</p>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-gray-900'>{ticket.subject}</p>
                                                <p className='line-clamp-2 text-sm text-gray-600'>
                                                    {lastMessage?.message || 'No messages yet'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status & Priority */}
                                        <div className='lg:col-span-1'>
                                            <p className='mb-1 text-sm text-gray-500'>Status</p>
                                            <div className='space-y-2'>
                                                <Badge
                                                    className={`${statusConfig[ticket.status as Status].color} flex w-fit items-center gap-1`}>
                                                    {ticket.status === 'open' ? (
                                                        <AlertCircle className='h-3 w-3' />
                                                    ) : (
                                                        <CheckCircle className='h-3 w-3' />
                                                    )}
                                                    {statusConfig[ticket.status as Status].label}
                                                </Badge>
                                                <Badge className={`${priorityConfig[priority].color} text-xs`}>
                                                    {priorityConfig[priority].label} Priority
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Created Date */}
                                        <div className='lg:col-span-1'>
                                            <p className='mb-1 text-sm text-gray-500'>Created Date</p>
                                            <div className='flex items-center gap-2'>
                                                <Calendar className='h-4 w-4 text-gray-400' />
                                                <p className='text-gray-900'>
                                                    {moment(ticket.created_at).format('DD-MM-YYYY hh:mm A')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className='flex justify-start lg:col-span-1 lg:justify-end'>
                                            <Button
                                                onClick={() => openChatModal(ticket.id)}
                                                className={
                                                    ticket.status === 'open' ? 'bg-blue-600 hover:bg-blue-700' : ''
                                                }
                                                variant={ticket.status === 'open' ? 'default' : 'outline'}
                                                size='sm'>
                                                {ticket.status === 'open' ? (
                                                    <>
                                                        <MessageCircle className='mr-2 h-4 w-4' />
                                                        Chat
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className='mr-2 h-4 w-4' />
                                                        View Chat
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {filteredTickets.length > 0 && (
                <Card>
                    <CardContent className='p-4'>
                        <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
                            <p className='text-sm text-gray-600'>
                                Showing {filteredTickets.length} of {totalTickets} tickets
                            </p>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    disabled={currentPage <= 1}
                                    onClick={() => setPage(Math.max(1, currentPage - 1))}>
                                    Previous
                                </Button>
                                <Button variant='outline' size='sm'>
                                    {currentPage}
                                </Button>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    disabled={currentPage >= lastPage}
                                    onClick={() => setPage(Math.min(lastPage, currentPage + 1))}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Chat Modal */}
            <ChatModal
                ticket={selectedTicket}
                ticketDetails={ticketDetails?.data}
                isOpen={isChatModalOpen}
                onClose={closeChatModal}
                onSendMessage={handleSendMessage}
                isPending={isSendingMessage}
            />

            {/* Create Ticket Modal */}
            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreateTicket={handleCreateTicket}
                isPending={isCreatingTicket}
            />
        </div>
    );
};

export default CustomerSupportPage;
