import { z } from 'zod';

export const orderStatusEnum = z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
export const orderPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);
export const categoryEnum = z.enum(['electronics', 'apparel', 'home', 'beauty', 'sports']);

export const orderItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre del producto es obligatorio'),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.number().positive('El precio unitario debe ser positivo'),
  costPrice: z.number().nonnegative('El costo debe ser cero o positivo').default(0),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'El nombre del cliente debe tener al menos 2 caracteres'),
  customerEmail: z.string().email('Correo electrónico inválido'),
  category: categoryEnum,
  priority: orderPriorityEnum.default('medium'),
  status: orderStatusEnum.default('pending'),
  shippingAddress: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  items: z.array(orderItemSchema).min(1, 'Debe incluir al menos un producto'),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
});

export const bulkUpdateOrdersSchema = z.object({
  orderIds: z.array(z.string()).min(1, 'Debe seleccionar al menos un pedido'),
  status: orderStatusEnum.optional(),
  priority: orderPriorityEnum.optional(),
  action: z.enum(['update_status', 'update_priority', 'delete']),
});

export const analyticsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
  status: orderStatusEnum.optional(),
  category: categoryEnum.optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type BulkUpdateOrdersInput = z.infer<typeof bulkUpdateOrdersSchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
