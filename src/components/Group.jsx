/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file 'LICENSE'                       *
 ********************************************************************************/

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { action, observable, makeObservable } from 'mobx';
import { observer } from 'mobx-react';

import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Modal from 'react-bootstrap/lib/Modal';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';

import store, { MGroup } from '../Store';

@observer export default class Group extends Component {
  static propTypes = {
    group: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired
  };

  @observable bodyVisible = false;
  @observable inputValid = true;
  @observable deleteModalVisible = false;

  @action toggleBodyVisibility = () => { this.bodyVisible = !(this.bodyVisible); }
  @action setInputValidity = (valid) => { this.inputValid = valid; }
  @action openDeleteModal = () => { this.deleteModalVisible = true; }
  @action closeDeleteModal = () => { this.deleteModalVisible = false; }

  editGroupBtn;

  shouldComponentUpdate = () => true

  hideEditGroupButton = (e) => {
    e.preventDefault();
    this.setInputValidity(true);
    this.editGroupBtn.hide();
  }

  handleEditGroup = (e) => {
    e.preventDefault();

    if (e.target[0].form[0].value === '') {
      this.setInputValidity(false);
      return;
    }

    var otherGroups = store.main.groups.filter(g => g.id !== this.props.group.id);
    if (otherGroups.some(g => g.id === e.target[0].form[0].value)) {
      this.setInputValidity(false);
      return;
    }

    const group = new MGroup;
    group.id = e.target[0].form[0].value;
    group.n = e.target[0].form[1].value;

    var tasksIndex = 0;
    store.tasks.forEach((t, index) => {
      tasksIndex++;
      for (var i = 0; i < e.target[0].form[index + 2].value; i++) {
        group.tasks.push(t.id);
      }
    });
    store.collections.forEach((c, index) => {
      for (var i = 0; i < e.target[0].form[tasksIndex + index + 2].value; i++) {
        group.collections.push(c.id);
      }
    });

    store.editMainGroup(this.props.index, group);
    this.editGroupBtn.hide();

  }

  handleRemoveGroup = () => {
    store.removeMainGroup(this.props.index);
    this.closeDeleteModal();
  }

  constructor(props) {
    super(props);
    makeObservable(this);
  }

  render() {
    var TaskCheckboxes = [];
    var CollectionCheckboxes = [];

    store.tasks.forEach((task, i) => {
      var count = 0;
      this.props.group.tasks.forEach(currentTask => {
        if (task.id === currentTask) {
          count++;
        }
      });
      TaskCheckboxes.push(
        <div className="ct-box ct-box-task" key={'t-box' + i}>
          <div className="element-name" title={task.id}>{task.id}</div>
          <FormGroup>
            <FormControl className="add-cg-tc-counter" type="number" min="0" defaultValue={count} />
          </FormGroup>
        </div>
      );
    });

    store.collections.forEach((collection, i) => {
      var count = 0;
      this.props.group.collections.forEach(currentCollection => {
        if (collection.id === currentCollection) {
          count++;
        }
      });
      CollectionCheckboxes.push(
        <div className="ct-box ct-box-collection" key={'c-box' + i}>
          <div className="element-name" title={collection.id}>{collection.id}</div>
          <FormGroup>
            <FormControl className="add-cg-tc-counter" type="number" min="0" defaultValue={count} />
          </FormGroup>
        </div>
      );
    });

    return (
      <div className="group">
        <h5>
          <span className="glyphicon glyphicon-tasks"></span>
          {this.props.group.id}
          <span
            className={this.bodyVisible ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down'}
            title={this.bodyVisible ? 'hide' : 'show'}
            onClick={this.toggleBodyVisibility}>
          </span>

          <span className="glyphicon glyphicon-trash" title="remove" onClick={this.openDeleteModal}></span>
          <Modal show={this.deleteModalVisible} onHide={this.closeDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Delete <strong>{this.props.group.id}</strong>?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to delete the group <strong>{this.props.group.id}?</strong></p>
            </Modal.Body>
            <Modal.Footer>
              <Button bsStyle="danger" onClick={this.handleRemoveGroup}>Delete</Button>
              <Button onClick={this.closeDeleteModal}>Cancel</Button>
            </Modal.Footer>
          </Modal>

          <OverlayTrigger trigger="click" placement="right" ref={(el) => this.editGroupBtn = el} onClick={() => this.setInputValidity(true)} overlay={
            <Popover className="add-cg-popover group-popover" title="edit group" id={this.props.group.id}>
              <form onSubmit={this.handleEditGroup}>
                <InputGroup>
                  <InputGroup.Addon>id</InputGroup.Addon>
                  <FormControl type="text" onFocus={() => this.setInputValidity(true)} className={this.inputValid ? '' : 'invalid-input'} defaultValue={this.props.group.id} />
                  <InputGroup.Addon>n</InputGroup.Addon>
                  <FormControl className="add-cg-tc-counter" type="text" defaultValue={this.props.group.n} />
                </InputGroup>
                <p>Tasks in this group:</p>
                {TaskCheckboxes}
                <p>Collections in this group:</p>
                {CollectionCheckboxes}
                <div className="row">
                  <div className="col-xs-12">
                    <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">edit</Button>
                    <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideEditGroupButton}>cancel</Button>
                  </div>
                </div>
              </form>
            </Popover>
          }>
            <span className="glyphicon glyphicon-edit" title="edit"></span>
          </OverlayTrigger>
        </h5>
        <div className={this.bodyVisible ? 'visible-container' : 'invisible-container'}>
          <div><strong> n: </strong><span className="plain">{this.props.group.n}</span></div>
          <hr />
          <div className="group-tasks">
            {this.props.group.tasks.map((task, i) => {
              return <span key={i}>{task}</span>;
            })}
          </div>
          <div className="group-collections">
            {this.props.group.collections.map((collection, i) => {
              return <span key={i}>{collection}</span>;
            })}
          </div>
        </div>
      </div>
    );
  }
}
