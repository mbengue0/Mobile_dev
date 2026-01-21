-- Migration: Add NabooPay support to wallet_transactions

-- 1. Add new columns to wallet_transactions
ALTER TABLE wallet_transactions 
ADD COLUMN IF NOT EXISTS external_reference TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'cashier' CHECK (provider IN ('cashier', 'naboopay'));

-- 2. Update existing rows to have default values (already handled by DEFAULT, but good for clarity)
-- UPDATE wallet_transactions SET provider = 'cashier', status = 'completed' WHERE provider IS NULL;

-- 3. Update the add_wallet_funds RPC to handle the new columns
-- This RPC is primarily used by the Cashier (Admin)
CREATE OR REPLACE FUNCTION add_wallet_funds(
    p_user_id UUID,
    p_amount NUMERIC,
    p_description TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Insert transaction record (Cashier is always completed immediately)
    INSERT INTO wallet_transactions (user_id, amount, transaction_type, description, status, provider)
    VALUES (p_user_id, p_amount, 'deposit', p_description, 'completed', 'cashier');

    -- Update user's wallet balance
    UPDATE profiles
    SET wallet_balance = wallet_balance + p_amount
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atomic Webhook Handler
CREATE OR REPLACE FUNCTION confirm_naboo_payment(
    p_order_id TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_amount NUMERIC;
    v_user_id UUID;
    v_status TEXT;
BEGIN
    -- Check current status
    SELECT amount, user_id, status INTO v_amount, v_user_id, v_status
    FROM wallet_transactions
    WHERE external_reference = p_order_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Transaction not found');
    END IF;

    IF v_status = 'completed' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Already completed');
    END IF;

    IF v_status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid status: ' || v_status);
    END IF;

    -- Perform Updates
    UPDATE wallet_transactions
    SET status = 'completed',
        description = 'Online Top-Up (Confirmed)'
    WHERE external_reference = p_order_id;

    UPDATE profiles
    SET wallet_balance = wallet_balance + v_amount
    WHERE id = v_user_id;

    RETURN jsonb_build_object('success', true, 'new_balance', (SELECT wallet_balance FROM profiles WHERE id = v_user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
