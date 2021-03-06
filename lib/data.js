/*
 *  Library for storing and editing data (CRUD)
 *
 ** fileDescriptor uniquely identifies an open file in a computer's OS
 *
 */

//Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// container for the module (to be exported)
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = function (dir, file, data, callback) {
  // Open the file for writing
  fs.open(
    `${lib.baseDir}${dir}/${file}.json`,
    'wx', // Open file for writing. The file is created (if it does not exist), but fails if the path exists
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        // Convert data to a string
        let stringData = JSON.stringify(data);

        // Write to file an close it
        fs.writeFile(fileDescriptor, stringData, function (err) {
          if (!err) {
            fs.close(fileDescriptor, function (err) {
              if (!err) {
                callback(false);
              } else {
                callback('Error closing new File');
              }
            });
          } else {
            callback('Error writing to new file');
          }
        });
      } else {
        callback('Could not create new file, it may already exist');
      }
    },
  );
};

// Read data from a file
lib.read = function (dir, file, callback) {
  fs.readFile(
    lib.baseDir + dir + '/' + file + '.json',
    'utf8',
    function (err, data) {
      if (!err && data) {
        let parsedData = helpers.parseJsonToObject(data);
        callback(false, parsedData);
      } else {
        callback(err, data);
      }
    },
  );
};

// Update data inside a file
lib.update = function (dir, file, data, callback) {
  // open the file for writing
  fs.open(
    `${lib.baseDir}${dir}/${file}.json`,
    'r+', // Open file for reading and writing. An exception/error occurs if the file does not exist.

    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        // Convert data to a string
        let stringData = JSON.stringify(data);

        // Truncate the file
        fs.truncate(fileDescriptor, function (err) {
          if (!err) {
            // Write to file and close it
            fs.writeFile(fileDescriptor, stringData, function (err) {
              if (!err) {
                fs.close(fileDescriptor, function (err) {
                  if (!err) {
                    callback(false);
                  } else {
                    callback('Error closing the file');
                  }
                });
              } else {
                callback('Error writing to file');
              }
            });
          } else {
            callback('Error truncating file!');
          }
        });
      } else {
        callback(
          'Could not open the file for updating, it may  not exist  yet',
        );
      }
    },
  );
};

// Delete a file
lib.delete = function (dir, file, callback) {
  //Unlink the file
  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, function (err) {
    if (!err) {
      callback(false);
    } else {
      callnback('Error deleting file');
    }
  });
};

// Export the module
module.exports = lib;
