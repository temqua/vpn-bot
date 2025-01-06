create user vpn_readonly with password 'w%5H5k[0p5h~y"';

grant
select
    on all tables in schema public to vpn_readonly;