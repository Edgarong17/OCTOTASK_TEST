import React from 'react';
import './filterHeader.css';

function FilterHeader({
	isOpen,
	onToggle,
	hasActiveFilters,
	onClear,
	filterCriteria,
	onFilterChange,
	sprintOptions,
	assigneeOptions,
}) {
	return (
		<div className="fh-container">
			<div className="fh-actions">
				<button className="fh-filter-button" onClick={onToggle}>
					{isOpen ? 'Hide Filters' : 'Filter'}
				</button>
				{hasActiveFilters && (
					<button className="fh-clear-button" onClick={onClear}>
						Clear
					</button>
				)}
			</div>

			{isOpen && (
				<section className="fh-panel">
					<div className="fh-row">
						<label htmlFor="fh-title-filter">Title contains</label>
						<input
							id="fh-title-filter"
							type="text"
							value={filterCriteria.titleQuery}
							onChange={(event) => onFilterChange('titleQuery', event.target.value)}
							placeholder="search words in title"
						/>
					</div>

					<div className="fh-row">
						<label htmlFor="fh-status-filter">Status</label>
						<select
							id="fh-status-filter"
							value={filterCriteria.status}
							onChange={(event) => onFilterChange('status', event.target.value)}
						>
							<option value="all">All</option>
							<option value="Late">Late</option>
							<option value="Pending">Pending</option>
							<option value="On Going">In Progress</option>
							<option value="Done">Completed</option>
						</select>
					</div>

					<div className="fh-row">
						<label htmlFor="fh-priority-filter">Difficulty</label>
						<select
							id="fh-priority-filter"
							value={filterCriteria.priority}
							onChange={(event) => onFilterChange('priority', event.target.value)}
						>
							<option value="all">All</option>
							<option value="1">Low</option>
							<option value="2">Medium</option>
							<option value="3">High</option>
						</select>
					</div>

					<div className="fh-row">
						<label htmlFor="fh-sprint-filter">Sprint</label>
						<select
							id="fh-sprint-filter"
							value={filterCriteria.sprintId}
							onChange={(event) => onFilterChange('sprintId', event.target.value)}
						>
							<option value="all">All</option>
							{sprintOptions.map((sprint) => (
								<option key={sprint.id} value={String(sprint.id)}>
									{sprint.name}
								</option>
							))}
						</select>
					</div>

					<div className="fh-row">
						<label htmlFor="fh-assignee-filter">Filter by assignee</label>
						<select
							id="fh-assignee-filter"
							value={filterCriteria.assigneeId}
							onChange={(event) => onFilterChange('assigneeId', event.target.value)}
						>
							{assigneeOptions.length > 1 && <option value="all">All</option>}
							{assigneeOptions.map((assignee) => (
								<option key={assignee.id} value={String(assignee.id)}>
									{assignee.name}
								</option>
							))}
						</select>
					</div>

					<div className="fh-row">
						<label htmlFor="fh-delivery-date-filter">Delivery Date</label>
						<input
							id="fh-delivery-date-filter"
							type="date"
							value={filterCriteria.deliveryDate}
							onChange={(event) => onFilterChange('deliveryDate', event.target.value)}
						/>
					</div>
				</section>
			)}
		</div>
	);
}

export default FilterHeader;
