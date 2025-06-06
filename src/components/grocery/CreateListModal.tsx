import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGroceryStore } from '../../store/groceryStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (listId: string) => void;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createList } = useGroceryStore();
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Por favor, insira um nome para a lista');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const listId = await createList(name);
      
      if (listId) {
        setName('');
        if (onSuccess) {
          onSuccess(listId);
        }
        onClose();
      } else {
        setError('Erro ao criar lista. Por favor, tente novamente.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar lista');
    } finally {
      setIsSubmitting(false);
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
                Criar Nova Lista de Compras
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4">
              <form onSubmit={handleSubmit}>
                <Input
                  label="Nome da Lista"
                  id="list-name"
                  placeholder="ex: Compras da Semana"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    isLoading={isSubmitting}
                  >
                    Criar Lista
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};