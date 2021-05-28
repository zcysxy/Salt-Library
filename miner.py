import re
from flask import Flask, render_template, request, url_for, flash, redirect, Blueprint
from flask.blueprints import Blueprint
from flask_login import login_required, current_user
from werkzeug.exceptions import abort
import connect as con
import psycopg2

miner = Blueprint('miner', __name__)

@miner.route('/profile/')
@login_required
def profile():
    return render_template('profile.html', profile=current_user)