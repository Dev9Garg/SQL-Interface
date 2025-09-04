import {apiResponse} from '../utils/apiResponse.js'
import {asyncHandler} from "../utils/asyncHandler.js"
import {sequelize} from "../db/index.js"

const dangerous_keywords = ['drop database', 'create database', 'drop server', 'shutdown', 'xp_cmdshell', 'sp_configure', 'create login', 'alter login', 'drop login', 'backup', 'restore', 'bulk insert'];

function isQueryValid(query) {
	const normalizedQuery = query.toLowerCase().trim();

	//Block dangerous operations
	for(const keyword of dangerous_keywords) {
		if(normalizedQuery.includes(keyword)) {
			return false;
		}
	}

	return true;
}

const SQLQueryExecutor = asyncHandler(async (req, res) => {
	const {SQLQuery} = req.body;

	if(!SQLQuery || typeof SQLQuery !== 'string') {
		return res
		.status(400)
		.json({
			success: false,
			message: "Pass the query in a string format only !!"
		})
	}

	if(!isQueryValid(SQLQuery)) {
		return res
		.status(403)
		.json({
			success: false,
			message: "Query contains dangerous operations, you can't perform these !!"
		})
	}

	if(SQLQuery.length > 10000) {
		return res
		.status(400)
		.json({
			success: false,
			message: "This query is too long, query only till 10000 chars is allowed !!"
		})
	}

	try{
		const result = await sequelize.transaction(async (t) => {
			// executing with timeout and row limit
			const rows = await sequelize.query(SQLQuery, {
				transaction: t,
				timeout: 30000,
				type: sequelize.QueryTypes.SELECT
			});

			// console.log(rows);

			// limit result size to prevent memory loss
			const limitedRows = Array.isArray(rows) ? rows.slice(0, 1000) : rows;

			// console.log(limitedRows);

			return limitedRows;
		})

		console.log(result);

		return res
		.json(
			new apiResponse(
				200,
				result,
				"Query executed successfully !!"
			)
		)
	} catch (error) {
		console.error("Query execution error : ", error?.message);
		console.error("complete error : ", error);

		const errorMsg = error.message?.includes('timeout') ? 
			"Query timeout : Pls optimize your query and then try again"
			: (error?.message || "Query execution failed: pls check your syntax")

		return res
		.status(500)
		.json({
			success: false,
			message: errorMsg
		})
	}

})

// const changeDb = asyncHandler(async (req, res) => {
// 	const {newDb} = req.body;

// 	const dynamicConnection = await dynamicConnectdb(newDb)

// 	console.log(dynamicConnection);
		
	
// })

export {SQLQueryExecutor}
