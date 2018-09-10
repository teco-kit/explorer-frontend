import { store } from 'react-easy-state';

const datastore = store({
	datasetPage: {
		self: undefined,
		chart: null,
		handlers:{
			move: null,
		},
		edit: {
			enabled: false,
			selectedBand: -1,
		},
		highlightColor: 'orange',
		initialIndex: 0,
		borderWidth: 2,
		bands: [
		],
		states: [
			{
				name: 'apnea',
				buttonColor: 'success',
				color: '#28a745',
			},
			{
				name: 'hypopnea',
				buttonColor: 'info',
				color: '#17a2b8',
			},
			{
				name: 'noise',
				buttonColor: 'warning',
				color: '#ffc107',
			},
		],
		sort: () => {
			let bands = datastore.datasetPage.chart.xAxis.plotLinesAndBands.filter(elem => elem.id.split('_')[0] === 'band');

			// TODO: invert wrong-way-around bands
			/*for(let band of bands){
				// wrong way around?
				if(band.options.from > band.options.to){
					// swap edge points
					[band.options.from, band.options.to] = [band.options.to, band.options.from];


					const startref = band.lines.start;
					band.lines.start = 
					[{...band.lines.start}, {...band.lines.end}] = [{...band.lines.end}, {...band.lines.start}];
					console.log([{...band.lines.start}, {...band.lines.end}]);
				}
			}*/

			// sort arrray by position
			bands.sort((a, b) => {
				const mid = {
					a: new Date(a.options.from + ((a.options.to - a.options.from) / 2)),
					b: new Date(b.options.from + ((b.options.to - b.options.from) / 2)),
				};

				if(mid.a < mid.b){
					return -1;
				}
				
				if(mid.a > mid.b){
					return 1;
				}

				return 0;
			});

			let i=0;
			for(let band of bands){
				const id = band.id.split('_')[1];
				band.id = `band_${i}`;
				band.lines.start.id = `start_${i}`;
				band.lines.end.id = `end_${i}`;
				i++;
			}
		},
		updateHighlight: () => {
			let selBand = datastore.datasetPage.edit.selectedBand;
			let elems   = datastore.datasetPage.chart.xAxis.plotLinesAndBands;

			for(let band of elems.filter(elem => elem.id.split('_')[0] === 'band')){
				for(let line of [band.lines.start, band.lines.end]){
					line.svgElem.element.setAttribute('class', 'highcharts-plot-line dataset-plotline');
				}
			}
			if(datastore.datasetPage.edit.selectedBand !== -1){
				for(let line of [selBand.lines.start, selBand.lines.end]){
					line.svgElem.element.setAttribute('class', 'highcharts-plot-line dataset-plotline-selected');
				}
			}
		},
		fixSelected: () => {
			if((typeof datastore.datasetPage.edit.selectedBand.id) === 'undefined'){
				// fix selected (WTF?)
				const [type, id] = datastore.datasetPage.chart.xAxis.plotLinesAndBands.filter(elem => elem.svgElem.element.className.baseVal.includes('selected'))[0].id.split('_');
				datastore.datasetPage.edit.selectedBand = datastore.datasetPage.chart.xAxis.plotLinesAndBands.filter(elem => elem.id === `band_${id}`)[0];
			}
		}
	},
});

export default datastore;
