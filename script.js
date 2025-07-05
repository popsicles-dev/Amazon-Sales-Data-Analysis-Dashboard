// Generate sample data for visualization
function generateSampleData() {
    const categories = [
        'Electronics', 'Books', 'Home & Kitchen', 'Clothing',
        'Beauty', 'Sports', 'Toys', 'Automotive'
    ];
    const countries = [
        { name: "United States", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"] },
        { name: "United Kingdom", cities: ["London", "Manchester", "Birmingham", "Liverpool", "Edinburgh"] },
        { name: "Canada", cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"] },
        { name: "Germany", cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"] },
        { name: "Australia", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"] },
        { name: "India", cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai"] }
    ];
    const data = [];

    for (let i = 0; i < 500; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const discounted_price = Math.floor(Math.random() * 500) + 10;
        const original_price = discounted_price + Math.floor(Math.random() * 100) + 20;
        const discount_percentage = Math.floor(((original_price - discounted_price) / original_price) * 100);
        const rating = (Math.random() * 5).toFixed(1);
        const rating_count = Math.floor(Math.random() * 5000) + 100;

        const countryObj = countries[Math.floor(Math.random() * countries.length)];
        const city = countryObj.cities[Math.floor(Math.random() * countryObj.cities.length)];
        const sales_quantity = Math.floor(Math.random() * 1000) + 50;

        data.push({
            product_name: `Product ${i + 1}`,
            category: category,
            discounted_price: parseFloat(String(discounted_price).replace(/[^\d.]/g, '')) || 0,
            original_price: parseFloat(String(original_price).replace(/[^\d.]/g, '')) || 0,
            discount_percentage: discount_percentage,
            rating: parseFloat(rating) || 0,
            rating_count: parseInt(String(rating_count).replace(/[^\d]/g, '')) || 0,
            sales_quantity: sales_quantity,
            country: countryObj.name,
            city: city
        });
    }
    return data;
}

// Initialize dashboard
function initDashboard() {
    const data = generateSampleData();
    const ratingDiscountPriceRange = d3.select('#rating-discount-price-range');
    const ratingDiscountPriceValue = d3.select('#rating-discount-price-value');
    ratingDiscountPriceRange.on('input', function() {
        ratingDiscountPriceValue.text(`Max: $${this.value}`);
        updateRatingDiscountChartWithPrice();
    });

    const countries = [...new Set(data.map(d => d.country))];
    const countryFilter = d3.select('#category-country-filter');
    countryFilter.selectAll('option:not(:first-child)').remove();
    countries.forEach(country => {
        countryFilter.append('option')
            .attr('value', country)
            .text(country);
    });

    const categories = [...new Set(data.map(d => d.category))];
    const categoryFilter = d3.select('#category-filter');
    categories.forEach(category => {
        categoryFilter.append('option')
            .attr('value', category)
            .text(category);
    });

    const discountCategoryFilter = d3.select('#discount-category-filter');
    discountCategoryFilter.selectAll('option:not(:first-child)').remove();
    categories.forEach(category => {
        discountCategoryFilter.append('option')
            .attr('value', category)
            .text(category);
    });
    discountCategoryFilter.on('change', function() {
        updatePriceDistributionChart(data);
    });
    // event listeners
    d3.select('#category-filter').on('change', updateCharts);
    d3.select('#price-range').on('input', function() {
        d3.select('#price-value').text(`Max: $${this.value}`);
        updateCharts();
    });
    d3.select('#rating-filter').on('input', function() {
        d3.select('#rating-value').text(`Min: ${this.value}`);
        updateCharts();
    });
    d3.select('#category-rating-filter').on('change', function() {
        const minRating = parseFloat(d3.select('#category-rating-filter').property('value')) || 0;
        const selectedCountry = d3.select('#category-country-filter').property('value') || 'all';
        createCategoryProductionChart(data, minRating, selectedCountry);
    });
    d3.select('#category-country-filter').on('change', function() {
        const minRating = parseFloat(d3.select('#category-rating-filter').property('value'));
        const selectedCountry = d3.select('#category-country-filter').property('value');
        createCategoryProductionChart(data, minRating, selectedCountry);
    });

    const donutCategoryFilter = d3.select('#donut-category-filter');
    donutCategoryFilter.selectAll('option:not(:first-child)').remove();
    categories.forEach(category => {
        donutCategoryFilter.append('option')
            .attr('value', category)
            .text(category);
    });
    donutCategoryFilter.on('change', function() {
        updateDonutRatingChart(data);
    });

    const donutPriceRange = d3.select('#donut-price-range');
    const donutPriceValue = d3.select('#donut-price-value');
    donutPriceRange.on('input', function() {
        donutPriceValue.text(`Max: $${this.value}`);
        updateDonutRatingChart(data);
    });

    d3.select('#reset-filters').on('click', resetFilters);

    createPriceDistributionChart(data);
    createRatingDiscountChart(data);
    createCategoryBarChart(data);
    createDonutRatingChart(data);

    const tooltip = d3.select('.tooltip');

    // function updateCharts() {
    //     const category = d3.select('#category-filter').property('value');
    //     const maxPrice = d3.select('#price-range').property('value');
    //     const minRating = d3.select('#rating-filter').property('value');

    //     let filteredData = data;

    //     if (category !== 'all') {
    //         filteredData = filteredData.filter(d => d.category === category);
    //     }

    //     filteredData = filteredData.filter(d => d.discounted_price <= maxPrice);
    //     filteredData = filteredData.filter(d => d.rating >= minRating);

    //     updatePriceDistributionChart(data);
    //     updateRatingDiscountChartWithPrice();
    //     createCategoryProductionChart(data, 0, 'all');
    //     updateKPIs(data);
    // }
    function updateCharts() {
        // Only update KPIs based on global filters
        const category = d3.select('#category-filter').property('value');
        const maxPrice = d3.select('#price-range').property('value');
        const minRating = d3.select('#rating-filter').property('value');
        let filteredData = data;

        if (category !== 'all') {
            filteredData = filteredData.filter(d => d.category === category);
        }
        filteredData = filteredData.filter(d => d.discounted_price <= maxPrice);
        filteredData = filteredData.filter(d => d.rating >= minRating);

        // Only update KPIs
        updateKPIs(filteredData);
    }

    function updateAllCharts() {
        // Price Distribution chart uses its own category filter
        updatePriceDistributionChart(data);

        // Rating vs. Discount Percentage chart uses its own price range filter
        updateRatingDiscountChartWithPrice();

        // Category vs. Product Count chart uses its own rating and country filters
        const minRating = parseFloat(d3.select('#category-rating-filter').property('value')) || 0;
        const selectedCountry = d3.select('#category-country-filter').property('value') || 'all';
        createCategoryProductionChart(data, minRating, selectedCountry);

        // Donut chart uses its own filters
        updateDonutRatingChart(data);
    }

    // function resetFilters() {
    //     d3.select('#category-filter').property('value', 'all');
    //     d3.select('#price-range').property('value', 1000);
    //     d3.select('#price-value').text('Max: $1000');
    //     d3.select('#rating-filter').property('value', 0);
    //     d3.select('#rating-value').text('Min: 0');
    //     d3.select('#category-rating-filter').property('value', '0');
    //     d3.select('#category-country-filter').property('value', 'all');
    //     d3.select('#rating-discount-price-range').property('value', 1000);
    //     d3.select('#rating-discount-price-value').text('Max: $1000');
    //     d3.select('#donut-category-filter').property('value', 'all');
    //     d3.select('#donut-price-range').property('value', 1000);
    //     d3.select('#donut-price-value').text('Max: $1000');
    //     updateCharts();
    //     updateRatingDiscountChartWithPrice();
    //     updateDonutRatingChart(data);
    // }

    // Your functions for creating/updating charts:
    // Price Distribution by Category
    function resetFilters() {
        // Reset global filters
        d3.select('#category-filter').property('value', 'all');
        d3.select('#price-range').property('value', 1000);
        d3.select('#price-value').text('Max: $1000');
        d3.select('#rating-filter').property('value', 0);
        d3.select('#rating-value').text('Min: 0');

        // Reset individual chart filters
        d3.select('#category-rating-filter').property('value', '0');
        d3.select('#category-country-filter').property('value', 'all');
        d3.select('#rating-discount-price-range').property('value', 1000);
        d3.select('#rating-discount-price-value').text('Max: $1000');
        d3.select('#donut-category-filter').property('value', 'all');
        d3.select('#donut-price-range').property('value', 1000);
        d3.select('#donut-price-value').text('Max: $1000');

        // Update KPIs and all charts
        updateCharts();      // Updates KPIs with global filters (now reset)
        updateAllCharts();   // Updates all charts with full data or their own filters
    }

    function createPriceDistributionChart(data) {
        updatePriceDistributionChart(data);
    }

    function updatePriceDistributionChart(data) {
        const container = d3.select('#price-distribution-chart');
        container.selectAll('*').remove();

        // Get selected category
        const selectedCategory = d3.select('#discount-category-filter').property('value');
        let filteredData = data;
        if (selectedCategory && selectedCategory !== 'all') {
            filteredData = filteredData.filter(d => d.category === selectedCategory);
        }

        // Only include discounts between 5% and 70%
        filteredData = filteredData.filter(d => d.discount_percentage >= 5 && d.discount_percentage <= 70);

        if (filteredData.length === 0) {
            container.append('div')
                .style('display', 'flex')
                .style('justify-content', 'center')
                .style('align-items', 'center')
                .style('height', '100%')
                .style('color', '#999')
                .html('No data available for selected filters');
            return;
        }

        const margin = { top: 30, right: 30, bottom: 50, left: 60 };
        const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;

        const svg = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Bin by discount percentage (e.g., 5-15%, 15-25%, ..., 65-70%)
        const binStart = 5, binEnd = 70, binStep = 10;
        const thresholds = d3.range(binStart, binEnd + binStep, binStep);
        const bins = d3.bin()
            .domain([binStart, binEnd])
            .thresholds(thresholds)
            (filteredData.map(d => d.discount_percentage));

        // For each bin, calculate total sales (discounted_price * rating_count)
        const binData = bins.map(bin => {
            const products = filteredData.filter(d => d.discount_percentage >= bin.x0 && d.discount_percentage < bin.x1);
            const totalSales = d3.sum(products, d => d.discounted_price * d.rating_count);
            return {
                range: `${bin.x0}-${bin.x1 - 1}%`,
                totalSales: totalSales,
                count: products.length,
                x0: bin.x0,
                x1: bin.x1
            };
        });

        // X: Discount bins
        const xScale = d3.scaleBand()
            .domain(binData.map(d => d.range))
            .range([0, width])
            .padding(0.2);

        // Y: Total sales
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(binData, d => d.totalSales) * 1.1 || 100])
            .range([height, 0]);

        // Axes
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale));
        svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d3.format(".2s")(d)}`));

        // Axis labels
        svg.append('text')
            .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
            .style('text-anchor', 'middle')
            .text('Discount Percentage Range');
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Total Sales Value ($)');

        // Title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('Sales vs. Discount');

        // Draw bars
        svg.selectAll('.bar')
            .data(binData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.range))
            .attr('y', d => yScale(d.totalSales))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d.totalSales))
            .attr('fill', '#ff9900')
            .on('mouseover', function(event, d) {
                d3.select('.tooltip').style('opacity', 1)
                    .html(`<strong>${d.range}</strong><br>Total Sales: $${d3.format(",.0f")(d.totalSales)}<br>Count: ${d.count}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select('.tooltip').style('opacity', 0);
            });

        // Bar labels
        svg.selectAll('.label')
            .data(binData)
            .enter().append('text')
            .attr('class', 'label')
            .attr('x', d => xScale(d.range) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d.totalSales) - 5)
            .attr('text-anchor', 'middle')
            .text(d => d.totalSales ? `$${d3.format(".2s")(d.totalSales)}` : '')
            .style('font-size', '12px')
            .style('fill', '#333');
    }
    // RatingDiscountChartWithPrice
    function updateRatingDiscountChartWithPrice() {
        const maxPrice = +d3.select('#rating-discount-price-range').property('value');
        // Use the original data, not filtered by other dashboard filters
        const filtered = data.filter(d => d.discounted_price <= maxPrice);
        updateRatingDiscountChart(filtered);
    }

    function createCategoryProductionChart(data, minRating = 0, selectedCountry = 'all') {
        const container = d3.select('#category-production-chart');
        container.selectAll('*').remove();

        // Filter by minimum rating and country
        let filtered = data.filter(d => d.rating >= minRating);
        if (selectedCountry && selectedCountry !== 'all') {
            filtered = filtered.filter(d => d.country === selectedCountry);
        }

        // Group by category and count
        const categoryCounts = d3.rollup(
            filtered,
            v => v.length,
            d => d.category
        );

        // Sort categories alphabetically for a line graph
        const categoryData = Array.from(categoryCounts, ([category, count]) => ({ category, count }))
            .sort((a, b) => a.category.localeCompare(b.category));

        if (categoryData.length === 0) {
            container.append('div')
                .style('display', 'flex')
                .style('justify-content', 'center')
                .style('align-items', 'center')
                .style('height', '100%')
                .style('color', '#999')
                .html('No data available for selected filters');
            return;
        }

        const margin = { top: 30, right: 30, bottom: 50, left: 60 };
        const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;

        const svg = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // X: categories (ordinal)
        const xScale = d3.scalePoint()
            .domain(categoryData.map(d => d.category))
            .range([0, width])
            .padding(0.5);

        // Y: product count
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(categoryData, d => d.count) * 1.1])
            .range([height, 0]);

        // Axes
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .attr('transform', 'rotate(-15)')
            .style('text-anchor', 'end');

        svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale).ticks(5));

        // Axis labels
        svg.append('text')
            .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
            .style('text-anchor', 'middle')
            .text('Product Category');

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Number of Products');

        // Title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('Category vs. Product Count');

        // Line generator
        const line = d3.line()
            .x(d => xScale(d.category))
            .y(d => yScale(d.count));

        // Draw line
        svg.append('path')
            .datum(categoryData)
            .attr('fill', 'none')
            .attr('stroke', '#ff6b00')
            .attr('stroke-width', 3)
            .attr('d', line);

        // Draw points
        svg.selectAll('.point')
            .data(categoryData)
            .enter().append('circle')
            .attr('class', 'point')
            .attr('cx', d => xScale(d.category))
            .attr('cy', d => yScale(d.count))
            .attr('r', 6)
            .attr('fill', '#ff9900')
            .on('mouseover', function(event, d) {
                d3.select('.tooltip').style('opacity', 1)
                    .html(`<strong>${d.category}</strong><br>Products: ${d.count}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select('.tooltip').style('opacity', 0);
            });

        // Point labels
        svg.selectAll('.label')
            .data(categoryData)
            .enter().append('text')
            .attr('class', 'label')
            .attr('x', d => xScale(d.category))
            .attr('y', d => yScale(d.count) - 10)
            .attr('text-anchor', 'middle')
            .text(d => d.count)
            .style('font-size', '12px')
            .style('fill', '#333');
    }
    // RatingDiscountChart
    function createRatingDiscountChart(data) {
        const container = d3.select('#rating-discount-chart');
        container.selectAll('*').remove();

        const margin = { top: 30, right: 30, bottom: 50, left: 60 };
        const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;

        const svg = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, 5])
            .range([height, 0]);

        // Axes
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}%`));

        svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale).ticks(5));

        // Add axis labels
        svg.append('text')
            .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
            .style('text-anchor', 'middle')
            .text('Discount Percentage');

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Rating');

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('Rating vs. Discount Percentage');

        // Draw points
        svg.selectAll('.point')
            .data(data)
            .enter().append('circle')
            .attr('class', 'point')
            .attr('cx', d => xScale(d.discount_percentage))
            .attr('cy', d => yScale(d.rating))
            .attr('r', d => Math.sqrt(d.rating_count) / 15)
            .attr('fill', d => {
                const colors = ['#ff6b00', '#ff9900', '#ffbb00', '#ffd000', '#ffe000'];
                return colors[Math.floor(d.rating) - 1] || '#ff6b00';
            })
            .attr('opacity', 0.7)
            .on('mouseover', function(event, d) {
                d3.select('.tooltip').style('opacity', 1)
                    .html(`<strong>${d.product_name}</strong><br>
                          Rating: ${d.rating}<br>
                          Discount: ${d.discount_percentage}%<br>
                          Reviews: ${d.rating_count}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select('.tooltip').style('opacity', 0);
            });

        // Add trend line
        const line = d3.line()
            .x(d => xScale(d.discount_percentage))
            .y(d => yScale(d.rating));

        // Group data by discount percentage and calculate average rating
        const discountGroups = d3.range(0, 101, 5).map(discount => {
            const groupData = data.filter(d => 
                d.discount_percentage >= discount && d.discount_percentage < discount + 5
            );
            const avgRating = groupData.length > 0 ? d3.mean(groupData, d => d.rating) : 0;
            return { discount_percentage: discount + 2.5, rating: avgRating };
        });

        svg.append('path')
            .datum(discountGroups)
            .attr('fill', 'none')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('d', line);
    }

    function updateRatingDiscountChart(filteredData) {
        // Simplified update logic for demo
        createRatingDiscountChart(filteredData);
    }
    // DonutRatingChart
    function createDonutRatingChart(data) {
        updateDonutRatingChart(data);
    }

    function updateDonutRatingChart(data) {
        const container = d3.select('#donut-rating-chart');
        container.selectAll('*').remove();

        // Get selected filters
        const selectedCategory = d3.select('#donut-category-filter').property('value');
        const maxPrice = +d3.select('#donut-price-range').property('value');

        // Filter data
        let filtered = data;
        if (selectedCategory && selectedCategory !== 'all') {
            filtered = filtered.filter(d => d.category === selectedCategory);
        }
        filtered = filtered.filter(d => d.discounted_price <= maxPrice);

        // Bin ratings: 0–2, 2–3, 3–4, 4–5
        const bins = [
            { label: '0–2', min: 0, max: 2 },
            { label: '2–3', min: 2, max: 3 },
            { label: '3–4', min: 3, max: 4 },
            { label: '4–5', min: 4, max: 5.01 }
        ];
        const binCounts = bins.map(bin => ({
            label: bin.label,
            count: filtered.filter(d => d.rating >= bin.min && d.rating < bin.max).length
        }));

        // If no data, show message
        if (filtered.length === 0) {
            container.append('div')
                .style('display', 'flex')
                .style('justify-content', 'center')
                .style('align-items', 'center')
                .style('height', '100%')
                .style('color', '#999')
                .html('No data available for selected filters');
            return;
        }

        // Chart dimensions
        const width = container.node().getBoundingClientRect().width;
        const height = container.node().getBoundingClientRect().height;
        const radius = Math.min(width, height) / 2 - 30;

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Color scale
        const color = d3.scaleOrdinal()
            .domain(bins.map(b => b.label))
            .range(['#e74c3c', '#f1c40f', '#3498db', '#2ecc71']);

        // Pie generator
        const pie = d3.pie()
            .value(d => d.count)
            .sort(null);

        // Arc generator
        const arc = d3.arc()
            .innerRadius(radius * 0.6)
            .outerRadius(radius);

        // Draw arcs
        const arcs = svg.selectAll('arc')
            .data(pie(binCounts))
            .enter().append('g')
            .attr('class', 'arc');

        // arcs.append('path')
        //     .attr('d', arc)
        //     .attr('fill', d => color(d.data.label))
        //     .attr('stroke', '#222')
        //     .attr('stroke-width', 2)
        //     .on('mouseover', function(event, d) {
        //         d3.select('.tooltip').style('opacity', 1)
        //             .html(`<strong>${d.data.label} Stars</strong><br>Products: ${d.data.count}`)
        //             .style('left', (event.pageX + 10) + 'px')
        //             .style('top', (event.pageY - 28) + 'px');
        //     })
        //     .on('mouseout', function() {
        //         d3.select('.tooltip').style('opacity', 0);
        //     });

        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.label))
            .attr('stroke', '#222')
            .attr('stroke-width', 2)
            .on('mouseover', function(event, d) {
                // Lighten the arc color
                const origColor = d3.color(color(d.data.label));
                if (origColor) {
                    // Convert to HSL and increase lightness
                    const lighter = d3.hsl(origColor);
                    lighter.l = Math.min(1, lighter.l + 0.25); // Increase lightness by 0.25, max 1
                    d3.select(this).attr('fill', lighter.formatHex());
                }
                d3.select('.tooltip').style('opacity', 1)
                    .html(`<strong>${d.data.label} Stars</strong><br>Products: ${d.data.count}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function(event, d) {
                // Restore original color
                d3.select(this).attr('fill', color(d.data.label));
                d3.select('.tooltip').style('opacity', 0);
            });
        // Add labels
        arcs.append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .style('fill', '#fff')
            .style('font-size', '15px')
            .text(d => d.data.count > 0 ? d.data.label : '');

        // Add legend
        const legend = container.append('div')
            .attr('class', 'legend')
            .style('margin-top', '10px');
        binCounts.forEach(bin => {
            const item = legend.append('div').attr('class', 'legend-item');
            item.append('span')
                .attr('class', 'legend-color')
                .style('background', color(bin.label));
            item.append('span')
                .text(`${bin.label} Stars (${bin.count})`);
        });
    }

    function updateKPIs(data) {
        // Total Products
        document.getElementById('kpi-total-products').textContent = data.length;

        // Average Rating
        const avgRating = data.length ? (d3.mean(data, d => d.rating) || 0).toFixed(2) : '0.00';
        document.getElementById('kpi-average-rating').textContent = avgRating;

        // Total Sales Value (discounted_price * sales_quantity)
        const totalSales = data.reduce((sum, d) => sum + (d.discounted_price * d.sales_quantity), 0);
        document.getElementById('kpi-total-sales').textContent = '$' + d3.format(",.0f")(totalSales);

        // Total Reviews
        const totalReviews = data.reduce((sum, d) => sum + d.rating_count, 0);
        document.getElementById('kpi-total-reviews').textContent = d3.format(",")(totalReviews);
    }
    updateCharts();
    updateAllCharts();
}

document.addEventListener('DOMContentLoaded', initDashboard);
