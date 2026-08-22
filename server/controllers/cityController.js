// Seeded collection of global cities with meta-details
const CITIES_DATA = [
    {
        _id: 'c1',
        name: 'Paris',
        country: 'France',
        region: 'Europe',
        costIndex: 4,
        popularity: 5.0,
        description: 'The City of Light, world capital of art, fashion, gastronomy, and culture.',
        coverPhoto: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'
    },
    {
        _id: 'c2',
        name: 'Tokyo',
        country: 'Japan',
        region: 'Asia',
        costIndex: 3,
        popularity: 5.0,
        description: 'A bustling metropolis combining ultra-modern tech skyscrapers with historic shrines.',
        coverPhoto: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80'
    },
    {
        _id: 'c3',
        name: 'Rome',
        country: 'Italy',
        region: 'Europe',
        costIndex: 3,
        popularity: 4.8,
        description: 'The Eternal City, packing nearly 3,000 years of globally influential art, architecture, and ruins.',
        coverPhoto: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80'
    },
    {
        _id: 'c4',
        name: 'New York',
        country: 'United States',
        region: 'Americas',
        costIndex: 5,
        popularity: 4.9,
        description: 'The Big Apple, home of Times Square, Broadway, the Statue of Liberty, and infinite skyline views.',
        coverPhoto: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80'
    },
    {
        _id: 'c5',
        name: 'Sydney',
        country: 'Australia',
        region: 'Oceania',
        costIndex: 3,
        popularity: 4.5,
        description: 'Famous harbor city home to the iconic Opera House, Harbour Bridge, and Bondi Beach.',
        coverPhoto: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80'
    },
    {
        _id: 'c6',
        name: 'Cape Town',
        country: 'South Africa',
        region: 'Africa',
        costIndex: 2,
        popularity: 4.6,
        description: 'A stunning port city beneath Table Mountain, renowned for beaches, viticulture, and ocean cliffs.',
        coverPhoto: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=600&q=80'
    },
    {
        _id: 'c7',
        name: 'Cairo',
        country: 'Egypt',
        region: 'Africa',
        costIndex: 1,
        popularity: 4.3,
        description: 'Gateway to the ancient Pyramids of Giza, Sphinx, and the historic Nile River delta.',
        coverPhoto: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80'
    },
    {
        _id: 'c8',
        name: 'Bangkok',
        country: 'Thailand',
        region: 'Asia',
        costIndex: 1,
        popularity: 4.7,
        description: 'Renowned for ornate shrines, active street life, floating food markets, and boat-filled canals.',
        coverPhoto: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80'
    },
    {
        _id: 'c9',
        name: 'London',
        country: 'United Kingdom',
        region: 'Europe',
        costIndex: 4,
        popularity: 4.9,
        description: 'A global capital combining historical landmarks like Big Ben with contemporary art scenes.',
        coverPhoto: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80'
    },
    {
        _id: 'c10',
        name: 'Rio de Janeiro',
        country: 'Brazil',
        region: 'Americas',
        costIndex: 2,
        popularity: 4.4,
        description: 'Famed for its Copacabana beaches, mountaintop Redeemer statue, and spectacular Carnivals.',
        coverPhoto: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=600&q=80'
    }
];

// @desc    Get cities with search, filter, and sort support
// @route   GET /api/cities
// @access  Private
export const getCities = async (req, res) => {
    const { search, region, costIndex, sort } = req.query;

    try {
        let results = [...CITIES_DATA];

        // 1. Search Query
        if (search) {
            const query = search.toLowerCase();
            results = results.filter(city =>
                city.name.toLowerCase().includes(query) ||
                city.country.toLowerCase().includes(query) ||
                city.description.toLowerCase().includes(query)
            );
        }

        // 2. Region Filter
        if (region && region !== 'All') {
            results = results.filter(city => city.region === region);
        }

        // 3. Cost Filter
        if (costIndex) {
            results = results.filter(city => city.costIndex === Number(costIndex));
        }

        // 4. Sort
        if (sort === 'ratingDesc') {
            results.sort((a, b) => b.popularity - a.popularity);
        } else if (sort === 'costAsc') {
            results.sort((a, b) => a.costIndex - b.costIndex);
        } else if (sort === 'costDesc') {
            results.sort((a, b) => b.costIndex - a.costIndex);
        } else {
            // Default sort: alphabetical
            results.sort((a, b) => a.name.localeCompare(b.name));
        }

        res.status(200).json({
            status: 'success',
            data: results
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
