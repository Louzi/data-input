/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import * as d3 from "d3";

import { VisualFormattingSettingsModel } from "./settings";

export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: any;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
    }

    public update(options: VisualUpdateOptions) {
        const dataView = options.dataViews[0];
        if (!dataView || !dataView.categorical) return;

        // Clear existing content
        this.target.innerHTML = "";

        // Parse data
        const categorical = dataView.categorical;
        const categories = categorical.categories[0].values;
        const values = categorical.values[0].values.map(Number);

        // Get chart type from settings
        const chartType = "Pie"; // Default to Pie; update with user selection if implemented

        if (chartType === "Pie") {
            this.renderPieChart(categories, values);
        } else if (chartType === "Bar") {
            this.renderBarChart(categories, values);
        } else if (chartType === "Line") {
            this.renderLineChart(categories, values);
        }
    }

    private renderPieChart(categories: any[], values: number[]) {
        const width = 400;
        const height = 400;
        const radius = Math.min(width, height) / 2;

        const svg = d3.select(this.target)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const pie = d3.pie<number>().value(d => d);
        const arc = d3.arc<d3.PieArcDatum<number>>()
            .innerRadius(0)
            .outerRadius(radius);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const data = pie(values);

        svg.selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (_, i) => color(i.toString()));
    }

    private renderBarChart(categories: any[], values: number[]) {
        const width = 400;
        const height = 400;

        const svg = d3.select(this.target)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const x = d3.scaleBand()
            .domain(categories.map(String))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(values) as number])
            .range([height, 0]);

        svg.append("g")
            .selectAll("rect")
            .data(values)
            .enter()
            .append("rect")
            .attr("x", (_, i) => x(categories[i]) as number)
            .attr("y", d => y(d))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d))
            .attr("fill", "steelblue");

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));
    }

    private renderLineChart(categories: any[], values: number[]) {
        const width = 400;
        const height = 400;

        const svg = d3.select(this.target)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const x = d3.scalePoint()
            .domain(categories.map(String))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(values) as number])
            .range([height, 0]);

        const line = d3.line<number>()
            .x((_, i) => x(categories[i]) as number)
            .y(d => y(d));

        svg.append("path")
            .datum(values)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));
    }
}