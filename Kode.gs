/**
 * 
 * ini kode.gs ke 2 buat ambil data atlet
 * Fungsi doGet digunakan untuk menangani permintaan GET dari API.
 * Fungsi ini akan mengambil data dari sheet "Ingfo" dan mengembalikannya sebagai JSON.
 */
function doGet(e) {
  try {
    console.log("=== doGet START ===");
    console.log("Parameters received:", e.parameter);
    
    // Check if specific action is requested
    if (e && e.parameter && e.parameter.action) {
      console.log("Action requested:", e.parameter.action);
      
      if (e.parameter.action === "getAthletes") {
        return getAthletes(e.parameter);
      } else if (e.parameter.action === "getStats") {
        return getStats();
      }
    }
    
    // Default: return competitions list
    console.log("Getting competitions list...");
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ingfo');
    if (!sheet) {
      throw new Error("Sheet 'Ingfo' tidak ditemukan");
    }
    
    var data = sheet.getDataRange().getValues();
    console.log("Raw competition data:", data);
    
    if (data.length <= 1) {
      console.log("No competition data found");
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var result = data.slice(1).map(function(row, index) {
      return {
        id: String(row[0] || ""),
        nama: String(row[1] || ""),
        deskripsi: String(row[2] || ""),
        poster: String(row[3] || ""),
        status: parseInt(row[4]) || 0,
        closeDate: String(row[5] || "")
      };
    });
    
    console.log("Processed competitions:", result);
    console.log("=== doGet END ===");
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    console.error("Error in doGet:", e.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}



/**
 * Fungsi getStats untuk mengambil statistik kompetisi dan atlet
 * FIXED: Properly handle multiple categories separated by commas
 */
/**
 * Mengambil statistik untuk dashboard overview
 * VERSION: 1.3.0-PREMIUM
 */
function getStats() {
  try {
    console.log("=== getStats v1.3.0 START ===");
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var competitionSheet = ss.getSheetByName('Ingfo');
    var athleteSheet = ss.getSheetByName('Daftar');
    
    if (!competitionSheet || !athleteSheet) throw new Error("Sheet tidak lengkap");
    
    var competitionData = competitionSheet.getDataRange().getValues().slice(1);
    var athleteValues = athleteSheet.getDataRange().getValues();
    var athleteRows = athleteValues.slice(1);
    
    var activeCount = 0;
    for (var i = 0; i < competitionData.length; i++) {
        if (parseInt(competitionData[i][4]) === 1) activeCount++;
    }

    var totalAthletes = athleteRows.length;
    var maleCount = 0;
    var femaleCount = 0;
    var kyorugiCount = 0;
    var poomsaeCount = 0;
    
    // Efficiently loop once for stats
    for (var i = 0; i < athleteRows.length; i++) {
      var row = athleteRows[i];
      if (String(row[4]) === "Laki-laki") maleCount++; else if (String(row[4]) === "Perempuan") femaleCount++;
      
      var cat = String(row[10] || "").toLowerCase();
      if (cat.indexOf("kyorugi") !== -1) kyorugiCount++;
      if (cat.indexOf("poomsae") !== -1) poomsaeCount++;
    }

    // Capture ONLY the 10 latest athletes for the "Recent Log" to keep it FAST
    var recentAthletes = athleteRows.slice(-10).reverse().map(function(row, idx) {
      return {
        rowIndex: athleteRows.length - idx + 1, // approximate
        timestamp: String(row[0] || ""),
        nama: String(row[3] || ""),
        gender: String(row[4] || ""),
        sabuk: String(row[5] || ""),
        dojang: String(row[7] || ""),
        kategori: String(row[10] || ""),
        kelas: String(row[11] || "")
      };
    });

    var result = {
      version: "1.3.0-PREMIUM",
      totalCompetitions: competitionData.length,
      activeCompetitions: activeCount,
      closedCompetitions: competitionData.length - activeCount,
      totalAthletes: totalAthletes,
      categoryStats: { kyorugi: kyorugiCount, poomsae: poomsaeCount },
      genderStats: { male: maleCount, female: femaleCount },
      recentAthletes: recentAthletes,
      // Provide comp mapping for export
      competitions: competitionData.map(function(r){ return {id:String(r[0]), nama:String(r[1])}; })
    };
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ error: e.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Mengambil list atlet pendaftaran dengan backend pagination & search
 */
function getAthletes(params) {
  try {
    var compId = params.competitionId;
    var search = (params.search || "").toLowerCase();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Daftar');
    var rows = sheet.getDataRange().getValues().slice(1);
    
    // Filter by competition
    var filtered = rows.map(function(r, i){ r._idx = i+2; return r; }).filter(function(r){
       var matchComp = !compId || String(r[2]) === compId;
       var matchSearch = !search || String(r[3]).toLowerCase().indexOf(search) !== -1 || String(r[7]).toLowerCase().indexOf(search) !== -1;
       return matchComp && matchSearch;
    });
    
    // Sort by newest
    filtered.sort(function(a, b){ return new Date(b[0]) - new Date(a[0]); });

    // Map to objects
    var result = filtered.map(function(row) {
      return {
        rowIndex: row._idx,
        timestamp: String(row[0] || ""),
        registrationId: String(row[1] || ""),
        idKejuaraan: String(row[2] || ""),
        nama: String(row[3] || ""),
        gender: String(row[4] || ""),
        sabuk: String(row[5] || ""),
        tempatTanggalLahir: String(row[6] || ""),
        dojang: String(row[7] || ""),
        berat: String(row[8] || ""),
        tinggi: String(row[9] || ""),
        kategori: String(row[10] || ""),
        kelas: String(row[11] || "")
      };
    });

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ error: e.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi doPost digunakan untuk menangani permintaan POST dari API.
 */
function doPost(e) {
  try {
    console.log("=== doPost START ===");
    console.log("Raw postData:", e.postData);
    
    var params;
    
    // Parse request data - improved to handle URL encoding properly
    if (e.postData && e.postData.contents) {
      try {
        // Try JSON first
        params = JSON.parse(e.postData.contents);
        console.log("Parsed as JSON:", params);
      } catch (jsonError) {
        console.log("JSON parse failed, trying URL encoded");
        
        // Try URL encoded with proper decoding
        try {
          var content = e.postData.contents;
          params = {};
          
          if (content.includes('=')) {
            var pairs = content.split('&');
            for (var i = 0; i < pairs.length; i++) {
              var pair = pairs[i].split('=');
              if (pair.length === 2) {
                var key = decodeURIComponent(pair[0]);
                var value = decodeURIComponent(pair[1].replace(/\+/g, ' ')); // Fix: Replace + with spaces
                params[key] = value;
              }
            }
          }
          console.log("Parsed as URL encoded:", params);
        } catch (urlError) {
          console.error("Both parsing methods failed");
          throw new Error("Invalid request format");
        }
      }
    } else if (e.parameter) {
      // Handle GET parameters
      params = e.parameter;
      console.log("Using GET parameters:", params);
    } else {
      throw new Error("No post data received");
    }
    
    var action = params.action;
    console.log("Action to perform:", action);
    
    if (!action) {
      throw new Error("No action specified");
    }
    
    var result;
    
    // Route to appropriate function
    switch (action) {
      case "createCompetition":
        result = createCompetition(params);
        break;
      case "updateCompetition":
        result = updateCompetition(params);
        break;
      case "deleteCompetition":
        result = deleteCompetitionCascade(params);
        break;
      case "migrateAthletes":
        result = migrateAthletes(params);
        break;
      case "create":
        result = createAthlete(params);
        break;
      case "update":
        result = updateAthlete(params);
        break;
      case "delete":
        result = deleteAthlete(params);
        break;
      default:
        throw new Error("Unknown action: " + action);
    }
    
    console.log("=== doPost END ===");
    return result;
    
  } catch (e) {
    console.error("Error in doPost:", e.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi createCompetition untuk menambahkan kompetisi baru
 */
function createCompetition(params) {
  try {
    console.log("=== createCompetition START ===");
    console.log("Params:", params);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ingfo');
    if (!sheet) {
      throw new Error("Sheet 'Ingfo' tidak ditemukan");
    }
    
    // Validate required fields
    if (!params.id || !params.nama || !params.deskripsi) {
      throw new Error("ID, nama, dan deskripsi wajib diisi");
    }
    
    // Check if ID already exists
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(params.id)) {
        throw new Error("ID Kejuaraan '" + params.id + "' sudah ada");
      }
    }
    
    // Handle poster upload via base64
    var posterUrl = String(params.poster || "");
    if (params.posterBase64 && String(params.posterBase64).indexOf("base64") !== -1) {
      var fileName = String(params.posterFileName || "POSTER_" + params.id + ".jpg");
      posterUrl = saveFileToDrive(params.posterBase64, fileName);
    }
    
    // Add new row
    var newRow = [
      String(params.id),
      String(params.nama),
      String(params.deskripsi),
      posterUrl,
      parseInt(params.status) || 0,
      String(params.closeDate || "")
    ];
    
    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    
    console.log("Competition created:", newRow);
    console.log("=== createCompetition END ===");
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Kompetisi berhasil ditambahkan",
        id: params.id
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    console.error("Error in createCompetition:", e.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi updateCompetition untuk mengupdate data kompetisi
 */
function updateCompetition(params) {
  try {
    console.log("=== updateCompetition START ===");
    console.log("Params:", params);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ingfo');
    if (!sheet) {
      throw new Error("Sheet 'Ingfo' tidak ditemukan");
    }
    
    // Validate required fields
    if (!params.id || !params.nama || !params.deskripsi) {
      throw new Error("ID, nama, dan deskripsi wajib diisi");
    }
    
    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    
    // Find the row to update
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(params.id)) {
        rowIndex = i + 1; // Sheet uses 1-based indexing
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error("Kompetisi dengan ID '" + params.id + "' tidak ditemukan");
    }
    
    console.log("Updating row:", rowIndex);
    
    // Handle poster upload via base64
    var posterUrl = String(params.poster || "");
    if (params.posterBase64 && String(params.posterBase64).indexOf("base64") !== -1) {
      var fileName = String(params.posterFileName || "POSTER_" + params.id + ".jpg");
      posterUrl = saveFileToDrive(params.posterBase64, fileName);
    }
    
    // Update the row with proper string handling
    sheet.getRange(rowIndex, 2).setValue(String(params.nama));
    sheet.getRange(rowIndex, 3).setValue(String(params.deskripsi));
    sheet.getRange(rowIndex, 4).setValue(posterUrl);
    sheet.getRange(rowIndex, 5).setValue(parseInt(params.status) || 0);
    sheet.getRange(rowIndex, 6).setValue(String(params.closeDate || ""));
    
    SpreadsheetApp.flush();
    
    console.log("Competition updated successfully");
    console.log("=== updateCompetition END ===");
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Kompetisi berhasil diupdate",
        id: params.id
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    console.error("Error in updateCompetition:", e.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi deleteCompetitionCascade untuk menghapus kompetisi dan semua atletnya
 */
function deleteCompetitionCascade(params) {
  try {
    console.log("=== deleteCompetitionCascade START ===");
    var competitionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ingfo');
    var athleteSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Daftar');
    
    if (!competitionSheet || !athleteSheet) {
      throw new Error("Sheets not found");
    }
    
    var compId = String(params.id);
    
    // 1. Delete Athletes first
    var athleteData = athleteSheet.getDataRange().getValues();
    var rowsDeleted = 0;
    // Iterate backwards to not mess up indices
    for (var i = athleteData.length - 1; i >= 1; i--) {
      if (String(athleteData[i][2]) === compId) {
        athleteSheet.deleteRow(i + 1);
        rowsDeleted++;
      }
    }
    
    // 2. Delete Competition
    var compData = competitionSheet.getDataRange().getValues();
    for (var j = 1; j < compData.length; j++) {
      if (String(compData[j][0]) === compId) {
        competitionSheet.deleteRow(j + 1);
        break;
      }
    }
    
    SpreadsheetApp.flush();
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Berhasil dihapus bersama " + rowsDeleted + " atlet" })).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ error: e.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi migrateAthletes untuk memindahkan atlet ke kejuaraan lain
 */
function migrateAthletes(params) {
  try {
    var athleteSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Daftar');
    var rowIndices = params.rowIndices; // Array of row indices
    var targetId = params.targetCompetitionId;
    
    if (!athleteSheet || !rowIndices || !targetId) {
      throw new Error("Missing params for migration");
    }
    
    if (typeof rowIndices === "string") rowIndices = JSON.parse(rowIndices);
    
    for (var i = 0; i < rowIndices.length; i++) {
        athleteSheet.getRange(rowIndices[i], 3).setValue(targetId);
    }
    
    SpreadsheetApp.flush();
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Migrasi " + rowIndices.length + " atlet berhasil" })).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ error: e.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi createAthlete untuk menambahkan atlet baru
 */
function createAthlete(params) {
  try {
    console.log("=== createAthlete START ===");
    console.log("Params:", params);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Daftar');
    if (!sheet) {
      throw new Error("Sheet 'Daftar' tidak ditemukan");
    }
    
    // Validate required fields
    var required = ['idKejuaraan', 'nama', 'gender', 'sabuk', 'tempatTanggalLahir', 'dojang', 'berat', 'tinggi', 'kategori', 'kelas'];
    for (var i = 0; i < required.length; i++) {
      if (!params[required[i]]) {
        throw new Error("Field '" + required[i] + "' wajib diisi");
      }
    }
    
    // Generate registration ID
    var timestamp = new Date().toISOString();
    var registrationId = "REG" + Date.now();
    
    var newRow = [
      timestamp,
      registrationId,
      String(params.idKejuaraan),
      String(params.nama),
      String(params.gender),
      String(params.sabuk),
      String(params.tempatTanggalLahir),
      String(params.dojang),
      String(params.berat),
      String(params.tinggi),
      String(params.kategori),
      String(params.kelas)
    ];
    
    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    
    console.log("Athlete created:", newRow);
    console.log("=== createAthlete END ===");
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Atlet berhasil ditambahkan",
        registrationId: registrationId
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    console.error("Error in createAthlete:", e.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi updateAthlete untuk mengupdate data atlet
 */
function updateAthlete(params) {
  try {
    console.log("=== updateAthlete START ===");
    console.log("Params:", params);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Daftar');
    if (!sheet) {
      throw new Error("Sheet 'Daftar' tidak ditemukan");
    }
    
    if (!params.rowIndex) {
      throw new Error("Row index tidak valid");
    }
    
    var rowIndex = parseInt(params.rowIndex);
    console.log("Updating row:", rowIndex);
    
    // Validate required fields
    var required = ['nama', 'gender', 'sabuk', 'tempatTanggalLahir', 'dojang', 'berat', 'tinggi', 'kategori', 'kelas'];
    for (var i = 0; i < required.length; i++) {
      if (!params[required[i]]) {
        throw new Error("Field '" + required[i] + "' wajib diisi");
      }
    }
    
    // Update the row with proper string handling (skip timestamp and registration ID)
    sheet.getRange(rowIndex, 4).setValue(String(params.nama));
    sheet.getRange(rowIndex, 5).setValue(String(params.gender));
    sheet.getRange(rowIndex, 6).setValue(String(params.sabuk));
    sheet.getRange(rowIndex, 7).setValue(String(params.tempatTanggalLahir));
    sheet.getRange(rowIndex, 8).setValue(String(params.dojang));
    sheet.getRange(rowIndex, 9).setValue(String(params.berat));
    sheet.getRange(rowIndex, 10).setValue(String(params.tinggi));
    sheet.getRange(rowIndex, 11).setValue(String(params.kategori)); // Multiple categories
    sheet.getRange(rowIndex, 12).setValue(String(params.kelas));
    
    if (params.foto && params.foto.includes("base64")) {
      var fileName = "PHOTO_" + params.registrationId + "_" + params.nama.replace(/\s+/g, '_') + ".jpg";
      var photoUrl = saveFileToDrive(params.foto, fileName);
      sheet.getRange(rowIndex, 13).setValue(photoUrl);
    }
    
    SpreadsheetApp.flush();
    
    console.log("Athlete updated successfully");
    console.log("=== updateAthlete END ===");
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Data atlet berhasil diupdate",
        registrationId: params.registrationId
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    console.error("Error in updateAthlete:", e.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi deleteAthlete untuk menghapus data atlet
 */
function deleteAthlete(params) {
  try {
    console.log("=== deleteAthlete START ===");
    console.log("Params:", params);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Daftar');
    if (!sheet) {
      throw new Error("Sheet 'Daftar' tidak ditemukan");
    }
    
    if (!params.rowIndex) {
      throw new Error("Row index tidak valid");
    }
    
    var rowIndex = parseInt(params.rowIndex);
    console.log("Deleting row:", rowIndex);
    
    // Delete the row
    sheet.deleteRow(rowIndex);
    SpreadsheetApp.flush();
    
    console.log("Athlete deleted successfully");
    console.log("=== deleteAthlete END ===");
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Data atlet berhasil dihapus"
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    console.error("Error in deleteAthlete:", e.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper function to save Base64 file to Google Drive
 */
function saveFileToDrive(base64Data, fileName) {
  try {
    var folderId = "1Ksnqf8pBPDZH-TSDvTf_Z-wPByUlJKeD";
    var folder = DriveApp.getFolderById(folderId);
    
    var contentType = "image/jpeg";
    var realData = base64Data;
    
    // Pisahkan header base64 jika ada (data:image/jpeg;base64,...)
    if (base64Data.indexOf(',') !== -1) {
      var parts = base64Data.split(',');
      contentType = parts[0].split(':')[1].split(';')[0];
      realData = parts[1];
    }
    
    var bytes = Utilities.base64Decode(realData);
    var blob = Utilities.newBlob(bytes, contentType, fileName);
    
    var file = folder.createFile(blob);
    // HAPUS setSharing karena sering diblokir oleh Google Workspace policy.
    // File otomatis mengikuti izin foldernya yang sudah public.
    
    return "https://drive.google.com/uc?id=" + file.getId();
  } catch (e) {
    throw new Error("Gagal simpan ke Drive: " + e.toString());
  }
}

// FUNGSI INI CUMA BUAT MANCING POP-UP IZIN FULL DRIVE
function pancingIzinDrive() {
  var folderId = "1Ksnqf8pBPDZH-TSDvTf_Z-wPByUlJKeD";
  var folder = DriveApp.getFolderById(folderId);
  var dummy = folder.createFile("PANCINGAN_IZIN.txt", "dummy content");
  dummy.setTrashed(true);
  console.log("IZIN FULL DRIVE (BACA & TULIS) BERHASIL DIDAPATKAN!");
}

