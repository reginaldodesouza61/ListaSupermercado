import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, ShoppingCart, Clock } from 'lucide-react';
import { GroceryList } from '../../types';
import { Card, CardContent } from '../ui/Card';

interface ListCardProps {
  list: GroceryList;
}

export const ListCard: React.FC<ListCardProps> = ({ list }) => {
  const navigate = useNavigate();
  
  const formattedDate = new Date(list.created_at).toLocaleDateString('pt-BR');
  
  return (
    <Card 
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => navigate(`/lists/${list.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <ShoppingCart size={20} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Lista: {list.name}
              </h3>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <Clock size={16} className="mr-1" />
                <span>Criada em {formattedDate}</span>
              </div>
            </div>
          </div>
          
          {list.shared && (
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
              <Share2 size={12} className="mr-1" />
              Shared
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};