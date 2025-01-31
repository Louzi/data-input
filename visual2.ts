"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import * as d3 from "d3";

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
        const categories = categorical.categories[0].values.map(String);
        const values = categorical.values[0].values.map(Number);
        const averages = categorical.values[1].values.map(Number);

        const data = categories.map((category, i) => ({
            category,
            value: values[i],
            average: averages[i]
        }));
        data.sort((a, b) => a.category.localeCompare(b.category)); // Alphabetical order

        const sortedCategories = data.map(d => d.category);
        const sortedValues = data.map(d => d.value);
        const sortedAverages = data.map(d => d.average);

        this.renderBarChart(sortedCategories, sortedValues, sortedAverages);
    }

    private renderBarChart(categories: string[], values: number[], averages: number[]) {
        const width = 600;
        const height = 400;
        const margin = { top: 30, right: 50, bottom: 50, left: 50 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const svg = d3.select(this.target)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scaleBand()
            .domain(categories)
            .range([0, chartWidth])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, 8])
            .nice()
            .range([chartHeight, 0]);

        // Bars
        chartGroup.selectAll(".bar")
            .data(values)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (_, i) => xScale(categories[i])!)
            .attr("y", d => yScale(d))
            .attr("width", xScale.bandwidth())
            .attr("height", d => chartHeight - yScale(d))
            .attr("fill", "#a2b8e9"); // Light blue color for bars

        // Markers (Orange Squares)
        chartGroup.selectAll(".marker")
            .data(averages)
            .enter()
            .append("rect")
            .attr("class", "marker")
            .attr("x", (_, i) => xScale(categories[i])! + xScale.bandwidth() / 2 - 5)
            .attr("y", d => yScale(d) - 5)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "#ff7f0e"); // Orange color for markers

        // X-Axis
        chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", "12px");

        // Y-Axis
        chartGroup.append("g")
            .call(d3.axisLeft(yScale).ticks(8));

        // Legend
        const legendGroup = svg.append("g")
            .attr("transform", `translate(${width - 120},${margin.top})`);

        legendGroup.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", "#ff7f0e"); // Orange for marker legend

        legendGroup.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .text("Frequence moy.")
            .style("font-size", "12px")
            .style("alignment-baseline", "middle");

        legendGroup.append("rect")
            .attr("x", 0)
            .attr("y", 20)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", "#a2b8e9"); // Light blue for bar legend

        legendGroup.append("text")
            .attr("x", 20)
            .attr("y", 30)
            .text("Frequence")
            .style("font-size", "12px")
            .style("alignment-baseline", "middle");

        // Title
        // svg.append("text")
        //     .attr("x", width / 2)
        //     .attr("y", margin.top / 2)
        //     .attr("text-anchor", "middle")
        //     .style("font-size", "16px")
        //     .style("font-weight", "bold")
        //     .text("1.1 Fréquences TOTALES par destination");
    }
}
