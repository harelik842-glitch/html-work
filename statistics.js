async function loadPostsByGroupChart() {
    try {
        const response =
            await fetch('/api/posts/stats/by-group');

        if (!response.ok) {
            throw new Error(
                'Failed to load posts statistics'
            );
        }

        const data = await response.json();

        const container =
            d3.select('#postsByGroupChart');

        container.html('');

        if (data.length === 0) {
            container
                .append('div')
                .attr('class', 'text-muted')
                .text('אין נתונים להצגה');

            return;
        }


        const width = 800;
        const height = 400;

        const margin = {
            top: 30,
            right: 30,
            bottom: 80,
            left: 60
        };


        const svg = container
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr(
                'viewBox',
                `0 0 ${width} ${height}`
            )
            .style('max-width', '100%')
            .style('height', 'auto');


        const x = d3
            .scaleBand()
            .domain(
                data.map(item =>
                    item.groupName
                )
            )
            .range([
                margin.left,
                width - margin.right
            ])
            .padding(0.3);


        const maxPosts =
            d3.max(
                data,
                item => item.postsCount
            ) || 1;

        const y = d3
            .scaleLinear()
            .domain([0, maxPosts])
            .nice()
            .range([
                height - margin.bottom,
                margin.top
            ]);


        svg
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr(
                'x',
                item => x(item.groupName)
            )
            .attr(
                'y',
                item => y(item.postsCount)
            )
            .attr(
                'width',
                x.bandwidth()
            )
            .attr(
                'height',
                item =>
                    y(0) -
                    y(item.postsCount)
            )
            .attr('rx', 6)
            .attr('fill', '#0d6efd');


        svg
            .selectAll('.bar-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'bar-label')
            .attr(
                'x',
                item =>
                    x(item.groupName) +
                    x.bandwidth() / 2
            )
            .attr(
                'y',
                item =>
                    y(item.postsCount) - 8
            )
            .attr(
                'text-anchor',
                'middle'
            )
            .attr('font-weight', 'bold')
            .text(
                item => item.postsCount
            );


        svg
            .append('g')
            .attr(
                'transform',
                `translate(0,${
                    height - margin.bottom
                })`
            )
            .call(
                d3.axisBottom(x)
            );


        svg
            .append('g')
            .attr(
                'transform',
                `translate(${margin.left},0)`
            )
            .call(
                d3.axisLeft(y)
                    .ticks(maxPosts)
                    .tickFormat(
                        d3.format('d')
                    )
            );

    } catch (error) {

        console.error(
            'Error loading posts by group chart:',
            error
        );

        document.getElementById(
            'postsByGroupChart'
        ).innerHTML = `
            <div class="text-danger">
                לא ניתן לטעון את נתוני הגרף
            </div>
        `;
    }
}





async function loadUsersByCityChart() {
    try {
        const response =
            await fetch('/api/users/stats/by-city');

        if (!response.ok) {
            throw new Error(
                'Failed to load users statistics'
            );
        }

        const data = await response.json();

        const container =
            d3.select('#usersByCityChart');

        container.html('');

        if (data.length === 0) {
            container
                .append('div')
                .attr('class', 'text-muted')
                .text('אין נתונים להצגה');

            return;
        }

        const width = 800;
        const height = 400;

        const margin = {
            top: 30,
            right: 30,
            bottom: 80,
            left: 60
        };

        const svg = container
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr(
                'viewBox',
                `0 0 ${width} ${height}`
            )
            .style('max-width', '100%')
            .style('height', 'auto');

        const x = d3
            .scaleBand()
            .domain(
                data.map(item => item.city)
            )
            .range([
                margin.left,
                width - margin.right
            ])
            .padding(0.3);

        const maxUsers =
            d3.max(
                data,
                item => item.usersCount
            ) || 1;

        const y = d3
            .scaleLinear()
            .domain([0, maxUsers])
            .nice()
            .range([
                height - margin.bottom,
                margin.top
            ]);

        svg
            .selectAll('.city-bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'city-bar')
            .attr(
                'x',
                item => x(item.city)
            )
            .attr(
                'y',
                item => y(item.usersCount)
            )
            .attr(
                'width',
                x.bandwidth()
            )
            .attr(
                'height',
                item =>
                    y(0) -
                    y(item.usersCount)
            )
            .attr('rx', 6)
            .attr('fill', '#198754');

        svg
            .selectAll('.city-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'city-label')
            .attr(
                'x',
                item =>
                    x(item.city) +
                    x.bandwidth() / 2
            )
            .attr(
                'y',
                item =>
                    y(item.usersCount) - 8
            )
            .attr(
                'text-anchor',
                'middle'
            )
            .attr('font-weight', 'bold')
            .text(
                item => item.usersCount
            );

        svg
            .append('g')
            .attr(
                'transform',
                `translate(0,${
                    height - margin.bottom
                })`
            )
            .call(
                d3.axisBottom(x)
            );

        svg
            .append('g')
            .attr(
                'transform',
                `translate(${margin.left},0)`
            )
            .call(
                d3.axisLeft(y)
                    .ticks(maxUsers)
                    .tickFormat(
                        d3.format('d')
                    )
            );

    } catch (error) {

        console.error(
            'Error loading users by city chart:',
            error
        );

        document.getElementById(
            'usersByCityChart'
        ).innerHTML = `
            <div class="text-danger">
                לא ניתן לטעון את נתוני הגרף
            </div>
        `;
    }
}

loadPostsByGroupChart();
loadUsersByCityChart();