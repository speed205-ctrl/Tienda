// ================================================================
// TECNOCELL - SUPABASE CLIENT CONFIGURATION
// ================================================================

(function () {
    // Configuración de Supabase
    window.SUPABASE_CONFIG = window.SUPABASE_CONFIG || {
        url: 'https://TU_PROYECTO.supabase.co', // ej: https://xyzcompany.supabase.co
        anonKey: 'TU_ANON_KEY_DE_SUPABASE'      // Clave pública anónima (anon / public)
    };

    // Inicialización del cliente Supabase
    let tecnoSupabase = null;

    function initClient() {
        const url = window.SUPABASE_CONFIG.url;
        const key = window.SUPABASE_CONFIG.anonKey;

        if (window.supabase && window.supabase.createClient && url && !url.includes('TU_PROYECTO')) {
            try {
                tecnoSupabase = window.supabase.createClient(url, key);
            } catch (err) {
                console.warn('Error inicializando Supabase Client:', err);
                tecnoSupabase = null;
            }
        }
        return tecnoSupabase;
    }

    initClient();

    // Helpers de la Base de Datos
    const db = {
        isConfigured: () => {
            return tecnoSupabase !== null && !window.SUPABASE_CONFIG.url.includes('TU_PROYECTO');
        },

        // Obtener productos para la tienda pública
        getPublicProducts: async () => {
            if (!db.isConfigured()) return null;
            try {
                const { data, error } = await tecnoSupabase
                    .from('products')
                    .select('*')
                    .eq('is_active', true)
                    .order('id', { ascending: true });

                if (error) throw error;
                return data;
            } catch (err) {
                console.warn('Error cargando productos de Supabase:', err.message);
                return null;
            }
        },

        // Obtener todos los productos (para Admin)
        getAllProductsAdmin: async () => {
            if (!db.isConfigured()) return [];
            const { data, error } = await tecnoSupabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },

        // Crear un nuevo producto
        createProduct: async (productData) => {
            if (!db.isConfigured()) throw new Error('Supabase no está configurado.');
            const { data, error } = await tecnoSupabase
                .from('products')
                .insert([productData])
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        // Actualizar un producto existente
        updateProduct: async (id, productData) => {
            if (!db.isConfigured()) throw new Error('Supabase no está configurado.');
            const { data, error } = await tecnoSupabase
                .from('products')
                .update({ ...productData, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        // Eliminar un producto
        deleteProduct: async (id) => {
            if (!db.isConfigured()) throw new Error('Supabase no está configurado.');
            const { error } = await tecnoSupabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        },

        // Subir imagen a Supabase Storage
        uploadProductImage: async (file) => {
            if (!db.isConfigured()) throw new Error('Supabase no está configurado.');

            // Generar nombre de archivo único y seguro
            const fileExt = file.name.split('.').pop() || 'jpg';
            const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            const fileName = `${Date.now()}_${cleanName}.${fileExt}`;
            const filePath = `products/${fileName}`;

            const { error: uploadError } = await tecnoSupabase.storage
                .from('product-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Obtener URL pública
            const { data } = tecnoSupabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            return data.publicUrl;
        }
    };

    // Exportar globalmente
    window.tecnoDb = db;
    window.getSupabaseClient = () => tecnoSupabase;
    window.reinitSupabaseClient = initClient;
})();
