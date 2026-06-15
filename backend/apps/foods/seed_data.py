"""NFCT seed catalogue — mirrors the frontend mock so the dashboard renders
identically against the real API. Macros are per serving.
"""

DIETARY_TAGS = [
    ("vegetarian", "Vegetarian"),
    ("vegan", "Vegan"),
    ("halal", "Halal"),
    ("low_carb", "Low-carb"),
    ("high_protein", "High-protein"),
    ("gluten_free", "Gluten-free"),
    ("lactose_free", "Lactose-free"),
    ("pescatarian", "Pescatarian"),
]

FOODS = [
    {
        "slug": "jollof-rice", "name": "Jollof Rice", "nfct_code": "NFCT-0001", "emoji": "🍚",
        "kcal": 510, "protein_g": 12, "carbs_g": 86, "fat_g": 13,
        "serving_size": "1 plate (300g)",
        "description": "Smoky party-style rice cooked in a rich tomato-pepper base.",
        "tags": ["vegetarian", "halal"],
    },
    {
        "slug": "egusi-soup", "name": "Egusi Soup", "nfct_code": "NFCT-0002", "emoji": "🍲",
        "kcal": 430, "protein_g": 24, "carbs_g": 14, "fat_g": 31,
        "serving_size": "1 bowl (250g)",
        "description": "Melon-seed soup with leafy greens, assorted meat and fish.",
        "tags": ["high_protein", "low_carb", "halal", "gluten_free"],
    },
    {
        "slug": "pounded-yam", "name": "Pounded Yam", "nfct_code": "NFCT-0003", "emoji": "🥣",
        "kcal": 340, "protein_g": 4, "carbs_g": 80, "fat_g": 1,
        "serving_size": "1 wrap (200g)",
        "description": "Smooth, stretchy yam swallow — the classic soup partner.",
        "tags": ["vegetarian", "vegan", "halal", "gluten_free", "lactose_free"],
    },
    {
        "slug": "moi-moi", "name": "Moi Moi", "nfct_code": "NFCT-0004", "emoji": "🫓",
        "kcal": 210, "protein_g": 13, "carbs_g": 22, "fat_g": 8,
        "serving_size": "1 piece (150g)",
        "description": "Steamed bean pudding with peppers, onions and egg.",
        "tags": ["vegetarian", "high_protein", "halal", "gluten_free"],
    },
    {
        "slug": "akara", "name": "Akara", "nfct_code": "NFCT-0005", "emoji": "🧆",
        "kcal": 180, "protein_g": 9, "carbs_g": 14, "fat_g": 10,
        "serving_size": "3 balls (90g)",
        "description": "Crispy deep-fried bean fritters — a beloved breakfast bite.",
        "tags": ["vegetarian", "vegan", "halal", "gluten_free", "lactose_free"],
    },
    {
        "slug": "efo-riro", "name": "Efo Riro", "nfct_code": "NFCT-0006", "emoji": "🥬",
        "kcal": 290, "protein_g": 18, "carbs_g": 11, "fat_g": 20,
        "serving_size": "1 bowl (220g)",
        "description": "Rich Yoruba spinach stew with peppers, locust beans and fish.",
        "tags": ["high_protein", "low_carb", "halal", "gluten_free", "pescatarian"],
    },
    {
        "slug": "suya", "name": "Suya", "nfct_code": "NFCT-0007", "emoji": "🍢",
        "kcal": 320, "protein_g": 34, "carbs_g": 6, "fat_g": 18,
        "serving_size": "1 stick (160g)",
        "description": "Spicy grilled beef skewers crusted in peanut yaji spice.",
        "tags": ["high_protein", "low_carb", "halal", "gluten_free", "lactose_free"],
    },
    {
        "slug": "beans-plantain", "name": "Beans & Plantain", "nfct_code": "NFCT-0008", "emoji": "🍌",
        "kcal": 460, "protein_g": 17, "carbs_g": 72, "fat_g": 12,
        "serving_size": "1 plate (300g)",
        "description": "Stewed honey beans paired with fried ripe plantain.",
        "tags": ["vegetarian", "vegan", "high_protein", "halal", "lactose_free"],
    },
    {
        "slug": "ofada-rice", "name": "Ofada Rice & Ayamase", "nfct_code": "NFCT-0009", "emoji": "🍛",
        "kcal": 540, "protein_g": 20, "carbs_g": 74, "fat_g": 18,
        "serving_size": "1 plate (320g)",
        "description": "Local unpolished rice with smoky green-pepper designer stew.",
        "tags": ["halal", "gluten_free"],
    },
    {
        "slug": "pepper-soup", "name": "Catfish Pepper Soup", "nfct_code": "NFCT-0010", "emoji": "🐟",
        "kcal": 240, "protein_g": 30, "carbs_g": 5, "fat_g": 11,
        "serving_size": "1 bowl (250g)",
        "description": "Light, fiery broth of catfish simmered with native spices.",
        "tags": ["high_protein", "low_carb", "pescatarian", "halal", "gluten_free", "lactose_free"],
    },
    {
        "slug": "yam-porridge", "name": "Yam Porridge (Asaro)", "nfct_code": "NFCT-0011", "emoji": "🍠",
        "kcal": 420, "protein_g": 8, "carbs_g": 78, "fat_g": 10,
        "serving_size": "1 bowl (280g)",
        "description": "Soft mashed yam pottage in a palm-oil pepper sauce.",
        "tags": ["vegetarian", "vegan", "halal", "gluten_free", "lactose_free"],
    },
    {
        "slug": "eba", "name": "Eba & Okra", "nfct_code": "NFCT-0012", "emoji": "🍵",
        "kcal": 380, "protein_g": 10, "carbs_g": 70, "fat_g": 8,
        "serving_size": "1 wrap + soup (260g)",
        "description": "Garri swallow served with draw-y okra and seafood.",
        "tags": ["vegetarian", "halal", "gluten_free", "pescatarian"],
    },
    {
        "slug": "akamu-akara", "name": "Akamu (Pap)", "nfct_code": "NFCT-0013", "emoji": "🥛",
        "kcal": 160, "protein_g": 3, "carbs_g": 34, "fat_g": 1,
        "serving_size": "1 cup (250ml)",
        "description": "Smooth fermented corn pap — a gentle, warming breakfast.",
        "tags": ["vegetarian", "vegan", "halal", "gluten_free", "lactose_free"],
    },
    {
        "slug": "fried-rice", "name": "Nigerian Fried Rice", "nfct_code": "NFCT-0014", "emoji": "🍚",
        "kcal": 530, "protein_g": 16, "carbs_g": 78, "fat_g": 16,
        "serving_size": "1 plate (300g)",
        "description": "Curry-kissed rice tossed with liver, veg and shrimp.",
        "tags": ["halal"],
    },
    {
        "slug": "chicken-grilled", "name": "Grilled Chicken", "nfct_code": "NFCT-0015", "emoji": "🍗",
        "kcal": 280, "protein_g": 38, "carbs_g": 2, "fat_g": 13,
        "serving_size": "1 piece (150g)",
        "description": "Marinated chicken thigh grilled to a charred finish.",
        "tags": ["high_protein", "low_carb", "halal", "gluten_free", "lactose_free"],
    },
    {
        "slug": "plantain-chips", "name": "Plantain Chips", "nfct_code": "NFCT-0016", "emoji": "🍌",
        "kcal": 150, "protein_g": 1, "carbs_g": 24, "fat_g": 6,
        "serving_size": "1 pack (40g)",
        "description": "Crunchy thin-sliced plantain — the perfect snack.",
        "tags": ["vegetarian", "vegan", "halal", "gluten_free", "lactose_free"],
    },
]
