/**
 * StudyHabit — Offline-First Student Learning Habits Survey PWA
 * Google Apps Script Remote Backend API
 *
 * Provides RESTful endpoints between StudyHabit PWA and Google Sheets:
 * - GET: healthCheck, getSurveys
 * - POST: submitResponse, syncResponses
 *
 * Google Sheets Schema:
 * - Sheet 1 ('Surveys'): id, surveyId, surveyVersion, createdAt, deviceId, status
 * - Sheet 2 ('Responses'): id, surveyId, submittedAt, answers, deviceId
 *
 * Idempotency & Security:
 * - Enforces idempotency using unique submission UUID (id column).
 * - Duplicate submissions return duplicate: true without creating duplicate rows.
 * - Never exposes sheet write tokens to client frontend.
 */

var SHEET_SURVEYS = 'Surveys';
var SHEET_RESPONSES = 'Responses';

/**
 * Handles HTTP GET requests
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'healthCheck';

    if (action === 'healthCheck') {
      return createJsonResponse({
        success: true,
        status: 'ok',
        app: 'StudyHabit Google Apps Script API',
        message: 'StudyHabit backend is operational and ready to receive survey responses.',
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'getSurveys') {
      return handleGetSurveys();
    }

    return createJsonResponse({
      success: false,
      error: 'Unknown GET action: ' + action
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

/**
 * Handles HTTP POST requests
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        success: false,
        error: 'Missing or empty request payload'
      });
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createJsonResponse({
        success: false,
        error: 'Malformed JSON payload: ' + parseError.toString()
      });
    }

    var action = payload.action || 'submitResponse';

    if (action === 'submitResponse') {
      return handleSubmitResponse(payload.response);
    }

    if (action === 'syncResponses') {
      return handleSyncResponses(payload.responses);
    }

    return createJsonResponse({
      success: false,
      error: 'Unsupported POST action: ' + action
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: 'Server error: ' + err.toString()
    });
  }
}

/**
 * Handles single response submission with strict UUID idempotency check
 */
function handleSubmitResponse(response) {
  if (!response || !response.id) {
    return createJsonResponse({
      success: false,
      error: 'Missing mandatory response ID (UUID)'
    });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateResponsesSheet(ss);
  var responseId = String(response.id).trim();

  // Check if UUID already exists to guarantee idempotency
  var existingRow = findRowByUuid(sheet, responseId);
  var now = new Date().toISOString();

  if (existingRow > 0) {
    // Already recorded - return idempotent success
    return createJsonResponse({
      success: true,
      duplicate: true,
      id: responseId,
      syncedAt: now,
      message: 'Response already synchronized (idempotent result)'
    });
  }

  // Serialize answers
  var answersJson = typeof response.answers === 'object'
    ? JSON.stringify(response.answers)
    : String(response.answers || '{}');

  var surveyId = response.surveyId || 'study-habit-survey-2026';
  var submittedAt = response.createdAt || response.updatedAt || now;
  var deviceId = response.deviceId || 'pwa-client';

  // Append new row matching required schema:
  // [id, surveyId, submittedAt, answers, deviceId]
  sheet.appendRow([
    responseId,
    surveyId,
    submittedAt,
    answersJson,
    deviceId
  ]);

  return createJsonResponse({
    success: true,
    id: responseId,
    syncedAt: now,
    message: 'Response synchronized'
  });
}

/**
 * Batch synchronization of multiple responses
 */
function handleSyncResponses(responses) {
  if (!responses || !Array.isArray(responses)) {
    return createJsonResponse({
      success: false,
      error: 'Invalid responses array'
    });
  }

  var results = [];
  for (var i = 0; i < responses.length; i++) {
    var res = handleSubmitResponse(responses[i]);
    results.push(res);
  }

  return createJsonResponse({
    success: true,
    syncedCount: results.length,
    results: results
  });
}

/**
 * Retrieves surveys from the Surveys sheet
 */
function handleGetSurveys() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_SURVEYS);
  if (!sheet) {
    return createJsonResponse({ success: true, surveys: [] });
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return createJsonResponse({ success: true, surveys: [] });
  }

  var surveys = [];
  for (var i = 1; i < data.length; i++) {
    surveys.push({
      id: data[i][0],
      surveyId: data[i][1],
      surveyVersion: data[i][2],
      createdAt: data[i][3],
      deviceId: data[i][4],
      status: data[i][5]
    });
  }

  return createJsonResponse({ success: true, surveys: surveys });
}

/**
 * Finds existing row index by UUID (Column 1)
 */
function findRowByUuid(sheet, uuid) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 0;

  var idValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < idValues.length; i++) {
    if (String(idValues[i][0]).trim() === uuid) {
      return i + 2; // 1-based row index
    }
  }
  return 0;
}

/**
 * Auto-creates Responses sheet with required columns if not exists:
 * Columns: id, surveyId, submittedAt, answers, deviceId
 */
function getOrCreateResponsesSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_RESPONSES);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_RESPONSES);
    var headers = ['id', 'surveyId', 'submittedAt', 'answers', 'deviceId'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#0284c7')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Auto-creates Surveys sheet with required columns if not exists:
 * Columns: id, surveyId, surveyVersion, createdAt, deviceId, status
 */
function getOrCreateSurveysSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_SURVEYS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_SURVEYS);
    var headers = ['id', 'surveyId', 'surveyVersion', 'createdAt', 'deviceId', 'status'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#0369a1')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Standardized JSON response helper with CORS allowance
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
