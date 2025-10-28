# Latest Updates - GST & Edit Features

## 🎉 New Features Added

### 1. GST Tax Support
- **GST Field in Menu Items**: Each menu item can now have a GST percentage (0-100%)
- **Automatic GST Calculation**: GST is automatically calculated in the cart
- **Order Breakdown**: Orders now show:
  - Subtotal (before GST)
  - GST Amount
  - Grand Total (with GST)
- **GST Display**: Each item in the cart shows its GST percentage

### 2. Edit Menu Items
- **Edit Button**: Each menu item now has an "Edit" button
- **Edit Mode**: Clicking edit populates the form with existing data
- **Update Functionality**: Save changes to update the item
- **Cancel Option**: Cancel editing to return to add mode

## Database Changes Required

### Run this SQL in Supabase SQL Editor:

```sql
-- Add GST percentage column to menu_items table
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT 0;

-- Update existing items to have 0% GST
UPDATE menu_items 
SET gst_percentage = 0 
WHERE gst_percentage IS NULL;

-- If you haven't added customer fields yet, run this too:
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;
```

## How to Use New Features

### Adding/Editing Menu Items with GST

1. Go to **"Manage Items"** page
2. Fill in the form:
   - Item Name: e.g., "Coffee"
   - Price: e.g., "30"
   - GST (%): e.g., "5" (for 5% GST)
   - Category: e.g., "Beverages"
   - Available: Check/Uncheck
3. Click **"Add Item"** or **"Update Item"** (if editing)

### Editing an Existing Item

1. Go to **"Manage Items"** page
2. Find the item in the table
3. Click **"Edit"** button
4. The form will populate with existing data
5. Make your changes
6. Click **"Update Item"**
7. Or click **"Cancel"** to return to add mode

### Taking Orders with GST

1. Go to **"Orders"** page
2. Enter customer name and phone number
3. Click on menu items to add to cart
4. You'll see:
   - Each item's price and GST percentage
   - Subtotal (sum of all item prices)
   - Total GST (sum of all GST amounts)
   - Grand Total (Subtotal + GST)
5. Click **"Mark as Paid"** to save the order

## Example Calculation

**Order:**
- Tea (₹20, GST 5%) x 2 = ₹40
  - GST on Tea: ₹40 × 5% = ₹2
- Coffee (₹30, GST 5%) x 1 = ₹30
  - GST on Coffee: ₹30 × 5% = ₹1.50

**Order Summary:**
- Subtotal: ₹70.00
- GST: ₹3.50
- Grand Total: ₹73.50

## Files Updated

1. `pages/add-items.js` - Added GST field and edit functionality
2. `pages/dashboard.js` - Added GST calculation and display
3. `supabase-add-gst.sql` - Database migration for GST column
4. `README.md` - Updated documentation

## Testing Checklist

- [ ] Run the SQL migration in Supabase
- [ ] Add a new menu item with GST
- [ ] Edit an existing menu item
- [ ] Take an order with items that have GST
- [ ] Verify GST calculation in cart
- [ ] Verify order is saved with correct total
- [ ] Check order in Supabase database

## Next Steps

1. **Run SQL Migration**: Execute `supabase-add-gst.sql` in Supabase SQL Editor
2. **Restart App**: Restart your development server
3. **Test Features**: Try adding/editing items with GST
4. **Take Test Order**: Create a test order to verify GST calculations

All features are now ready to use! 🚀

