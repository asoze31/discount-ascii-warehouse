import React, {Component} from 'react';
import oboe from 'oboe';
import ProductRow from './ProductRow.jsx';

export default class ProductTable extends Component {

	constructor( props ) {
		super( props );

		this.state = {
			tableData: [],
			rowCount: 20,
			isLoading: false,
			isFetching: false,
			isSorted: false,
			sortCrit: null
		};

		this.sortTable = this.sortTable.bind(this);
		this.baseState = this.state;
	}

	componentWillMount() {
		this.constructDataset( 'api' );
	}

	componentDidMount() {
	}

	fetch( limit, startAt, sortBy ) {
		this.setState( {
			isLoading: true
		});
		let idx = 0;
		if ( !limit || limit < 20 ) {
			limit = 20;
		}

		//Mandating that we'll always have a limit param
		let url = `api/products?limit=` + limit;

		let rows = [];

		if ( sortBy ) {
			url += `&sort=` + sortBy;
			//Reset state on sort
			this.setState( this.baseState );
			this.setState( {
				isSorted: true,
				sortCrit: sortBy
			});
		}

		if ( startAt ) {
			url += `&skipBy=` + startAt;
		}

		console.log("URL", url );

		let count = this.state.tableData.length;
		oboe( url )
			.done( function( elem ) {
				count++;
				let row = {
					id: elem.id,
					date: elem.date,
					face: elem.face,
					size: elem.size,
					price: elem.price
				};
				rows.push( row );

				if ( count % 20 == 0 ) {
					const adRow = {
						id: 'AD',
						date: null,
						face: this.getAdvert(),
						size: null,
						price: null
					}
					rows.push( adRow );
				}

				//Batching the state push
				if ( rows.length > limit ) {
					this.addRowsToState( rows );
				}
			}.bind( this ) );
	}

	getAdvert() {
		let idAttempt = Math.floor( Math.random()*1000 );
		let dup = false;
		const adIds = this.state.displayedAds;
		for( let i = 0; i < adIds; i++ ) {
			if ( idAttempt == adIds[i] ) {
				dup = true;
			}
		}

		if ( dup ) {
			return Math.floor( Math.random()*1000 );
		} else {
			return idAttempt;
		}
	}	

	addRowsToState( rows ) {
		let newRows = this.state.tableData.concat( rows );
		this.setState({ 
		    tableData: newRows,
		    isLoading: false
		})
	}

	constructDataset( source, url ) {
		if ( source && source === 'api' ) {
			this.fetch( `20` );
		}
		// else if ( source && source === 'sortedApi' ) {
		// 	this.fetch( null, null, 'price' );
		// }
		// else if ( source && source === 'timedPull' ) {
		// 	const self = this;
		// 	const time = setInterval( function() { self.fetch(`20`) }, 5000 );
		// }
	}

	buildRows() {
		let rows = [];
		let formattedRow = '';

		this.state.tableData.map( (rowData, idx) => {
			let currentRow = null;
			currentRow = (
				<ProductRow
					key = {'idx' + idx + Math.random()*1000}
					id = { rowData.id }
					size = { rowData.size }
					price = { rowData.price }
					face = { rowData.face }
					date = { rowData.date }
				></ProductRow>
				//I know I could just close it with />, but my syntax highlighting gets all messy, and I don't feel like screwing with it
			);
			rows.push( currentRow );
		});

		return rows;
	}

	sortTable( evt ) {
		const key = evt.target.innerHTML;
		let sortTerm = null;

		if ( key === 'Price' ) {
			sortTerm = `price`
		} else if ( key === 'ID' ) {
			sortTerm = `id`
		} else if ( key === 'Size' ) {
			sortTerm = `size`
		}

		this.fetch( `20`, null, sortTerm );
		this.buildRows();
	}

	pullMoreRows( element ) {
		const percentDone = element.scrollTop / (element.scrollHeight - 262 );
		const rowCount = this.state.tableData.length;

		if ( percentDone > 0.9999 ) {
			let sortCriteria = null;
			if ( this.state.isSorted ) {
				sortCriteria = this.state.sortCrit;
			}
			this.fetch( `20`, rowCount, sortCriteria );
		}

		this.setState( {
			isFetching : false
		})
	}

	listenScrollEvent( e ) {
		if( !this.state.isFetching ) {
			this.setState({
				isFetching : true,
			});
			
			this.pullMoreRows( e.target );
		}
	}

	render() {
		let loadingAnim = null;
		if ( this.state.isLoading ) {
			loadingAnim = ( <div id="loading"></div> );
		}
		else { 
			loadingAnim = ( <div style={{display:'none'}} id="loading"></div> );
		}
		return (
			<div>
				{ loadingAnim }
				<table id="headerTable">
					<thead className="fixedHeader">
						<tr>
							<th className="id column" onClick={ this.sortTable }>ID</th>
							<th className="size column" onClick={ this.sortTable }>Size</th>
							<th className="price column" onClick={ this.sortTable }>Price</th>
							<th className="face column" >Face</th>
							<th className="date column" >Date</th>
						</tr>
					</thead>
				</table>

				<table id="bodyTable" onScroll={ this.listenScrollEvent.bind(this) }>
					<tbody className="scrollable">
						{this.buildRows() }
					</tbody>
				</table>
			</div>
		);
	}
}

ProductTable.propTypes = {
	data: React.PropTypes.array
}