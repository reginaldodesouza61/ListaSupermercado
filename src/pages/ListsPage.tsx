import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { useGroceryStore } from '../store/groceryStore';
import { Button } from '../components/ui/Button';
import { ListCard } from '../components/grocery/ListCard';
import { CreateListModal } from '../components/grocery/CreateListModal';

export const ListsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { lists, fetchLists, loading, currentList, fetchItems, items, setCurrentList, addItem } = useGroceryStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchLists();
  }, [fetchLists]);
  
  useEffect(() => {
    if (currentList) {
      fetchItems(currentList.id);
    }
  }, [currentList]);
  
  const handleCreateSuccess = (listId: string) => {
    navigate(`/lists/${listId}`);
  };
  
  const handleAddItem = async () => {
    if (!currentList) return;
    const product = prompt('Digite o nome do produto:');
    if (!product) return;
    const quantityStr = prompt('Digite a quantidade:');
    const unitPriceStr = prompt('Digite o preço unitário:');
    const quantity = Number(quantityStr);
    const unitPrice = Number(unitPriceStr);
    if (!quantityStr || isNaN(quantity) || !unitPriceStr || isNaN(unitPrice)) return alert('Quantidade e preço devem ser números!');
    await addItem(currentList.id, product, quantity, unitPrice);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Listas de Compras</h1>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => fetchLists()}
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} className="mr-2" />
            Nova Lista
          </Button>
        </div>
      </div>
      
      {loading && lists.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-500">Carregando suas listas de compras...</p>
        </div>
      ) : lists.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <ShoppingCart size={24} className="text-green-600" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma lista de compras</h3>
          <p className="mt-1 text-sm text-gray-500">
            Crie sua primeira lista de compras para começar
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={16} className="mr-2" />
              Criar Nova Lista
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <div
              key={list.id}
              onClick={() => {
                setCurrentList(list);
                navigate(`/lists/${list.id}`);
              }}
              style={{ cursor: 'pointer' }}
            >
              <ListCard list={list} />
              {/* Removido o botão "Adicionar Item" daqui */}
            </div>
          ))}
        </div>
      )}
      
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Rodapé com o crédito */}
      <footer className="mt-12 text-center text-gray-400 text-sm">
        Lista de Compras &copy; {new Date().getFullYear()}<br />
        Desenvolvido por Reginaldo de Souza
      </footer>
    </div>
  );
};

const ShoppingCart = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);