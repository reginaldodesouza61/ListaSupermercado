import React, { useState } from 'react';
import { useGroceryStore } from '../../store/groceryStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { calculateTotalPrice } from '../../lib/utils';

interface AddItemFormProps {
  listId: string;
}

export const AddItemForm: React.FC<AddItemFormProps> = ({ listId }) => {
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addItem } = useGroceryStore();
  
  const totalPrice = calculateTotalPrice(quantity, unitPrice);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await addItem(listId, product, quantity, unitPrice);
      setProduct('');
      setQuantity(1);
      setUnitPrice(0);
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Novo Item</h3>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Product"
            id="product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Nome do produto"
            required
            fullWidth
          />
        </div>
        
        <div>
          <Input
            label="Quantity"
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
            fullWidth
          />
        </div>
        
        <div>
          <Input
            label="Unit Price"
            id="unit-price"
            type="number"
            min="0"
            step="0.01"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            required
            fullWidth
          />
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          <span className="font-medium">Total:</span>{' '}
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}
        </div>
        
        <Button
          type="submit"
          isLoading={isSubmitting}
        >
          Add Item
        </Button>
      </div>
    </form>
  );
};