'use strict';
// + Require mongoose for actions
const mongoose = require('mongoose');

module.exports = function(app, myDataBase) {

  // + Creating issue schema
  const Schema = mongoose.Schema;

  const issueSchema = new Schema({
    assigned_to: String,
    status_text: String,
    open: Boolean,
    issue_title: String,
    issue_text: String,
    created_by: String,
    created_on: Date,
    updated_on: Date
  });

  const Issue = mongoose.model("Issue", issueSchema);

  // + Creating project schema
  const projectSchema = new Schema({
    project_name: String,
    issues: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue'
    }]
  });

  const Project = mongoose.model("Project", projectSchema);

  // + For testing purposes
  app.route('/api/DESTROY_ALL')
    .get((req, res) => {
      Issue.deleteMany().then(() => {
        console.log("Issues deleted.")

        Project.deleteMany().then(() => {
          console.log("Projects deleted.");
        });

        Issue.count({})
          .then((result) => {
            console.log("Current Issue.count({}): " + result);
          });

        Project.count({})
          .then((result) => {
            console.log("Current Project.count({}): " + result);
          });

        res.send({
          message: "Done deleting!"
        });
      })
    });

  // Routes for project
  app.route('/api/issues/:project')

    .get((req, res) => {
      // + For returning the array of issues for a project whose name matches :project

      //console.log("In .get()...");

      let project = req.params.project;

      Project.find({ project_name: project })
        .populate('issues')
        .then((populatedProject) => {
          console.log(populatedProject);

          if (populatedProject.length == 0) {
            console.log("No issues in project!");
            res.send([]);
          } else {
            // Set filters for returned list of issues
            let filters = {};
            if (req.query.assigned_to != null) filters.assigned_to = req.query.assigned_to;
            if (req.query.status_text != null) filters.status_text = req.query.status_text;
            if (req.query.open != null) filters.open = req.query.open;
            if (req.query.issue_title != null) filters.issue_title = req.query.issue_title;
            if (req.query.issue_text != null) filters.issue_text = req.query.issue_text;
            if (req.query.created_by != null) filters.created_by = req.query.created_by;
            if (req.query.created_on != null) filters.created_on = req.query.created_on;
            if (req.query.updated_on != null) filters.updated_on = req.query.updated_on;
            if (req.query._id != null) filters._id = req.query._id;

            console.log("Filters object:");
            for (let property in filters) {
              console.log("\n" + property + ": " + filters[property]);
            } // end for-loop

            // Set up our issueList to hold our results
            let issueList = [];

            // Go through array of issues and push them onto issueList if they make it through the filters
            console.log(populatedProject);

            populatedProject[0].issues.map((issue) => {
              //console.log("In ...issues.map(), looking at issue: ");
              console.log(issue);

              let allMatch = true;
              for (let prop in filters) {
                //console.log("Checking properties in filters vs. issue...");
                if (filters[prop] == issue[prop]) {
                  // console.log("Match: filters." + prop + " is " + filters[prop] + " and matches issue." + prop + ", " + issue[prop] + ".");
                } else {
                  //console.log("No match: filters." + prop + " is " + filters[prop] + " and does not match issue." + prop + ", " + issue[prop] + ".");
                  allMatch = false;
                  //console.log("allMatch: " + allMatch);
                } // end if-else for check
              } // end for

              // add to issueList if allMatch
              if (allMatch) {
                //console.log("allMatch is still true. Returning issue.");
                issueList.push(issue);
              } else {
                //console.log("Something didn't match. :( Not adding to issuesList.");
              } // end if-all for "allMatch"

            });
            // Return issueList
            console.log(issueList);
            res.send(issueList);
          } // end if-else checking if issues exist in project
        }); // end .then()
    }) // end .get()

    .post(function(req, res) {
      // + For new "projects" (submitted issues)

      /*console.log(
        "req.body.issue_title: " + req.body.issue_title +
        "req.body.issue_text: " + req.body.issue_text +
        "req.body.created_by: " + req.body.created_by
      );*/

      // Check for required fields
      if (req.body.issue_title != '' && req.body.issue_text != '' && req.body.created_by != '') {
        let project = req.params.project;

        let someIssue = new Issue({
          project: req.params.project,
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || '',
          status_text: req.body.status_text || '',
          created_on: new Date(Date.now()).toISOString(),
          updated_on: new Date(Date.now()).toISOString(),
          open: true
        });

        // Make sure someIssue's required fields aren't falsey
        if (!someIssue.issue_title || !someIssue.issue_text || !someIssue.created_by) {
          console.log("Submit issue on apitest: { error: 'required field(s) missing' }");
          res.send({
            error: 'required field(s) missing'
          })
        } else {
          someIssue.save();

          //console.log("Submit issue on apitest: " + someIssue);

          // Check if project already exists
          Project.findOne({ project_name: project })
            .then((thisProject) => {
              if (thisProject != null) {
                // If project already exists, just push the issue onto its "issues" array
                console.log("The project already exists, so we'll just push this issue onto its issues array.");
                thisProject.issues.push(someIssue);
                console.log(thisProject);
                thisProject.save();
              } else {
                // If the project doesn't already exist, create it first
                console.log("The project does not exist yet, so we have to create one for this issue.");
                let someProject = new Project({
                  project_name: project
                });
                console.log("New project's name: " + someProject.project_name);
                console.log(someIssue);
                someProject.issues.push(someIssue);
                console.log(someProject);
                someProject.save();
              } // end if-else to check if project is null

              res.send(someIssue);
            }); // end .then()
        } // end if-else for required fields 
      } // end if-else for form-submitted required fields
    }) // end post

    .put(async (req, res) => {
      // + For updating issues

      let project = req.params.project;
      let issue_id = req.body._id;

      // Check for ID
      if (!issue_id) {
        console.log("No _id provided. :( Sending error.");
        res.send({
          error: 'missing _id'
        });
      } else if (!req.body.issue_title && !req.body.issue_text && !req.body.created_by && !req.body.assigned_to && !req.body.status_text && !req.body.open) {
        console.log("No update fields sent...sending error...");
        res.send({
          error: 'no update field(s) sent',
          '_id': issue_id
        });
      } else {

        // See if the _id is valid...
        Issue.findById(issue_id)
          .then((theIssue) => {
            console.log("theIssue: ");
            console.log(theIssue);
            if (theIssue != null) {
              //console.log("Found an issue with this ID!");
            } else {
              console.log("Could not find an issue with this ID. :(");
              res.send({ error: 'could not update', '_id': issue_id });
            }
          });

        console.log("In .put()! _id is: " + issue_id);

        let updates = {};

        if (req.body.issue_title != '') {
          updates.issue_title = req.body.issue_title;
        }
        if (req.body.issue_text != '') {
          updates.issue_text = req.body.issue_text;
        }
        if (req.body.created_by != '') {
          updates.created_by = req.body.created_by;
        }
        if (req.body.assigned_to != '') {
          updates.assigned_to = req.body.assigned_to;
        }
        if (req.body.status_text != '') {
          updates.status_text = req.body.status_text;
        }
        if (req.body.open != null) {
          updates.open = false;
        }

        updates.updated_on = new Date(Date.now()).toISOString();
        //console.log("Something needs to be updated!");
        Issue.findOneAndUpdate({ _id: issue_id }, updates, { returnOriginal: false })
          .then((theIssue) => {
            console.log(theIssue);

            if (theIssue != null) {
              res.send({
                result: 'successfully updated',
                '_id': issue_id
              });
            }
          })
          .catch((err) => {
            console.log("(In .catch()) Could not update...for some reason..." + err);
            res.send({
              error: 'could not update', '_id': issue_id
            }); // end .catch()
          }); // end .findOneAndUpdate() chain
      } // end if-else for checking _id and other update fields

      console.log("Updated objects:");
      // For verifying update worked
      Project.find({ project_name: project })
        .then((thisProject) => {
          console.log("thisProject:");
          console.log(thisProject);
        });
      Issue.findById(issue_id)
        .then((thisIssue) => {
          console.log("thisIssue:");
          console.log(thisIssue);
        });

    }) // end .put()

    .delete(async (req, res) => {
      let project = req.params.project;
      let issue_id = req.body._id;

      console.log("In .deleteOne()...");

      //console.log("issue_id: " + issue_id);

      if (!issue_id) {
        console.log("No _id provided. :( Can't delete anything.");
        res.send({
          error: 'missing _id'
        });
      } else {
        Issue.deleteOne({ _id: issue_id })
          .then((result) => {
            console.log("deleteOne result: ");
            console.log(result.acknowledged + ", " + result.deletedCount);
            if (result.acknowledged && result.deletedCount == 1) {
              console.log(result + ": " + issue_id + " was successfully deleted.");
              res.send({
                result: 'successfully deleted',
                '_id': issue_id
              });
            } else if (!result.acknowledged || result.deletedCount == 0) {
              console.log("Could not delete " + issue_id + ", probably because it doesn't exist...? :(")
              res.send({
                error: 'could not delete',
                '_id': issue_id
              });
            }
          })
          .catch((err) => {
            console.log("Could not delete " + issue_id + ". :(")
            console.log(err.name + "\n" + err.message);
            res.send({
              error: 'could not delete',
              '_id': issue_id
            });
          }
          ); // end .deleteOne() chain
      } // end if-else (issue_id)
    }); // end .delete()

};
