import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { useGroceryStore } from '../../store/groceryStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ShareListModalProps {
  isOpen: boolean;
  listId: string;
  onClose: () => void;
}

export const ShareListModal: React.FC<ShareListModalProps> = ({
  isOpen,
  listId,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { shareList } = useGroceryStore();
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      
      const { error } = await shareList(listId, email);
      
      if (error) {
        setError(error.message || 'Failed to share list');
      } else {
        setSuccess(true);
        setEmail('');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block overflow-hidden text-left align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Share Shopping List
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4">
              {success ? (
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Mail className="h-5 w-5 text-green-400\" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        List shared successfully!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Input
                    label="Email Address"
                    id="share-email"
                    type="email"
                    placeholder="Enter the email of the person to share with"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={error || undefined}
                    fullWidth
                    autoFocus
                  />
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      fullWidth
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      isLoading={isLoading}
                    >
                      Share List
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};