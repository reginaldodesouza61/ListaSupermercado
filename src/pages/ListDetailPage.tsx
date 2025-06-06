import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, RefreshCw, Pencil } from 'lucide-react';
import { useGroceryStore } from '../store/groceryStore';
import { Button } from '../components/ui/Button';
import { AddItemForm } from '../components/grocery/AddItemForm';
import { GroceryItemRow } from '../components/grocery/GroceryItem';
import { ShareListModal } from '../components/grocery/ShareListModal';
import { formatCurrency } from '../lib/utils';

export const ListDetailPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const { 
    currentList,
    items,
    loading,
    fetchItems,
    fetchLists,
    lists,
    setCurrentList,
    renameList
  } = useGroceryStore();
  
  useEffect(() => {
    if (!listId) {
      navigate('/lists');
      return;
    }

    const loadData = async () => {
      await Promise.all([
        fetchLists(),
        fetchItems(listId)
      ]);
    };

    loadData();
  }, [listId, fetchItems, fetchLists, navigate]);

  useEffect(() => {
    if (listId && lists.length > 0) {
      const list = lists.find(l => l.id === listId);
      if (list) {
        setCurrentList(list);
      }
    }
  }, [lists, listId, setCurrentList]);
  
  const handleRename = async () => {
    if (!currentList) return;
    const newName = prompt('Digite o novo nome da lista:', currentList.name);
    if (newName && newName.trim() && newName !== currentList.name) {
      await renameList(currentList.id, newName.trim());
    }
  };
  
  if (loading && !currentList) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-500">Carregando detalhes da lista...</p>
      </div>
    );
  }
  
  if (!currentList) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lista não encontrada</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/lists')}
        >
          Voltar para Listas
        </Button>
      </div>
    );
  }
  
  const totalItems = items.length;
  const purchasedItems = items.filter(item => item.purchased).length;
  const totalCost = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const purchasedCost = items
    .filter(item => item.purchased)
    .reduce((sum, item) => sum + item.totalPrice, 0);
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/lists')}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-2 sm:mb-0"
          >
            <ArrowLeft size={16} className="mr-1" />
            Voltar para Listas
          </button>
          <div className="flex items-center mt-1">
            <h1 className="text-2xl font-bold text-gray-900">{currentList.name}</h1>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={handleRename}
              title="Renomear Lista"
            >
              <Pencil size={18} />
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-3 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => fetchItems(listId!)}
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 size={16} className="mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Resumo</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total de Itens</p>
              <p className="text-xl font-semibold">{totalItems}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Comprados</p>
              <p className="text-xl font-semibold">{purchasedItems} de {totalItems}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Custo Total</p>
              <p className="text-xl font-semibold">{formatCurrency(totalCost)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gasto</p>
              <p className="text-xl font-semibold">{formatCurrency(purchasedCost)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 rounded-full"
                style={{ width: `${totalItems ? (purchasedItems / totalItems * 100) : 0}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {totalItems ? Math.round(purchasedItems / totalItems * 100) : 0}% completo
            </p>
          </div>
        </div>
        
        <AddItemForm listId={listId!} />
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço Unitário
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  Nenhum item adicionado a esta lista ainda. Adicione seu primeiro item acima.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <GroceryItemRow key={item.id} item={item} />
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <ShareListModal
        isOpen={isShareModalOpen}
        listId={listId!}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};